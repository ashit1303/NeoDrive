#!/data/data/com.termux/files/usr/bin/bash

print_message() {
    case "$2" in
        success)
            COLOR="\e[1;32m" # Green
            ;;
        fail)
            COLOR="\e[1;31m" # Red
            ;;
        skip)
            COLOR="\e[1;34m" # Blue
            ;;
        info)
            COLOR="\e[1;33m" # Yellow
            ;;
        *)
            COLOR="\e[0m" # Default
            ;;
    esac
    echo -e "\n${COLOR}$1\e[0m\n"
}


# Pending tasks 
# Hold liftbridge and fluent bit
# 1. Create build file for every package for latest version - done 
# 2. Create config for every package - done
# 3. Download packages from repo and ru - done

header() {
    COLOR="\e[1;35m" # Purple
    RESET="\e[0m"     # Reset color

    echo -e "${COLOR}"
    cat <<EOF

# Install Git
# Install SSH
# Install Nginx
# Install Mailer
# Install DUC ddns
# Install Ollama
# Install MongoDB
# Install MariaDB
# Install Nodejs
# Install Redis
# Install Vector
# Install VictoriaMetrics
# Install Zincsearch
# Install SonicSearch

# Install Afwall+ or iptables
EOF
    echo -e "${RESET}"
}

header


read -r "Do you want to use root access? (y/n): " USE_ROOT_ACCESS

# Check if root access is available

if [ "$USE_ROOT_ACCESS" = "y" ]; then
    PREFIX="/data/data/com.termux/files/usr"
else  
    print_message "ROOT ACCESS NOT AVAILABLE" fail
    trap 'echo "Aborted due to an error"' ERR
    print_message "ROOT ACCESS NOT AVAILABLE" fail
    exit 1
    # PREFIX="$HOME/.termux"
fi

read -rp "Enter master username(admin): " MASTER_USER
read -rp "Enter master password(admin): " MASTER_PASSWORD

read -rp "Where do you want to keep your data files 1) ~/xData 2) ~/../xData 3) ~/.termux/xData 4) ~/storage/shared/xData (1 or 2 or 3 or 4)" PROD_DIR 
read -rp "Do you want to run services on start? (y/n): " RUN_SERVICES

# Later phase
# read -p "Do you want to build packages for latest version? (It will use built packages from repo instead) (y/n): " BUILD_PACKAGES 



if [ "$PROD_DIR" = "1" ]; then
    PROD_DIR="$HOME/xData"
elif [ "$PROD_DIR" = "2" ]; then
    PROD_DIR="$PREFIX/../xData"
elif [ "$PROD_DIR" = "3" ]; then
    PROD_DIR="$PREFIX/.termux/xData"
elif [ "$PROD_DIR" = "4" ]; then
    termux-setup-storage
    PROD_DIR="$PREFIX/storage/shared/xData"
else 
    print_message "Invalid choice" fail
    exit 1
fi

# I have created a directory in $HOME
mkdir -p "$PROD_DIR"

# Create boot directory if it doesn't exist
BOOT_DIR="$HOME/.termux/boot"
mkdir -p "$BOOT_DIR"
BOOT_SCRIPT="$BOOT_DIR/boot.sh"

# Create directory in $HOME/../prod
CONF_DIR="$PROD_DIR/conf"
DATA_DIR="$PROD_DIR/data"
LOGS_DIR="$PROD_DIR/logs"
mkdir -p "$DATA_DIR"
mkdir -p "$CONF_DIR"
mkdir -p "$LOGS_DIR"

# Store all responses in a file inside the created directory
RESPONSE_FILE="$PROD_DIR/termux-prep.conf"
exec > >(tee -a "$RESPONSE_FILE") 2>&1

print_message "Setting up termux..." info

print_message "Updating and upgrading packages..." info

pkg install root-repo -y && pkg upgrade -y && pkg upgrade -y


print_message "Installing necessary packages..." info

# pkg install tsu figlet openssh git curl tree wget nano nodejs termux-services iptables iproute2 nmap nginx arp-scan mariadb -y
for package in tsu figlet  curl tree wget nano termux-services iptables iproute2 nmap msmtp arp-scan openssh git nginx nodejs mariadb redis mongodb ; do
    if [ -x "$(command -v $package)" ]; then
        print_message "$package is already installed... Skipping..." skip
    else
        print_message "$package is not installed, installing..." info
        pkg install $package -y
        if [ -x "$(command -v $package)" ]; then
            print_message "$package installed successfully!" success
        else
            print_message "Failed to install $package" fail
        fi
    fi
done

echo "figlet -f slant 'Termux'" >> ~/.bashrc
echo 'PS1="\[\e[1;32m\]\u@\h:\[\e[0m\]\[\e[1;34m\]$(if [[ \"\$PWD\" == \"\$HOME/\" ]]; then echo \"\$HOME\"; else echo \"\~/\W\"; fi)\[\e[0m\]\$" ' >> ~/.bashrc

# Download and extract the archive
curl -L https://github.com/ashit1303/bash_scripts/releases/download/v1.0/aarch64.tar.xz -o aarch64.tar.xz
tar -xf aarch64.tar.xz

# Move all extracted files to $PREFIX/bin
mv -n aarch64/* $PREFIX/bin/

# Clean up
rm -rf aarch64 aarch64.tar.xz


CONFIG_FILE="$HOME/pkgs.ini"

# Ensure required directories exist
mkdir -p "$CONF_DIR" "$DATA_DIR" "$LOGS_DIR"

# Function to read values from the config file
read_config() {
    local package="$1"
    local key="$2"
    local value=$(awk -F= -v section="[$package]" -v key="$key" '
        $0 ~ section {found=1; next} 
        found && $1 ~ key {print $2; exit}
    ' "$CONFIG_FILE" | tr -d '[:space:]')

    echo "$value"
}

print_message "Creating startup script..." info
# Function to update configs
update_configs() {
    while IFS= read -r line; do
        if [[ $line =~ ^\[([a-zA-Z0-9_-]+)\]$ ]]; then
            PACKAGE="${BASH_REMATCH[1]}"

            # Read values from config file
            PORT=$(read_config "$PACKAGE" "port")
            BIND_IP=$(read_config "$PACKAGE" "bind_ip")
            # if BIND_IP ===0.0.0.0 then open firewall 
            if [ "$BIND_IP" = "0.0.0.0" ]; then
                sudo iptables -A INPUT -p tcp --dport "$PORT" -j ACCEPT
            fi
            # Define paths
            DATA_PATH="$DATA_DIR/$PACKAGE"
            LOGS_PATH="$LOGS_DIR/$PACKAGE"
            # Ensure directories exist
            mkdir -p "$DATA_PATH" "$LOGS_PATH"
            
            # if "$PACKAGE" = "sonic"; then 
            if [ "$PACKAGE" = "mariadb" ]; then
                CONFIG_PATH="$CONF_DIR/$PACKAGE.conf"
                # insert into boot script
                echo "mariadbd_safe --defaults-file=$CONFIG_PATH > /dev/null 2>> $LOGS_PATH/$PACKAGE.log" >> "$BOOT_SCRIPT"
                cat > "$CONFIG_PATH" <<EOF
[mysqld]
# Basic Settings
user = mysql
port = $PORT
bind-address = $BIND_IP

# Custom Database Directory
datadir = $DATA_PATH
socket=$PREFIX/var/run/mysqld.sock

# Logging
log-error = $LOGS_PATH/$PACKAGE/error.log
slow-query-log = 1
slow-query-log-file = $LOGS_PATH/$PACKAGE/slow.log

# Performance Tweaks
innodb_buffer_pool_size = 256M
max_connections = 30
query_cache_size = 16M
query_cache_limit = 4M
innodb_file_per_table = 1
innodb_flush_log_at_trx_commit = 2
innodb_log_file_size = 256M
innodb_flush_method = O_DIRECT

# Security Settings
# Disabling symbolic links is recommended to prevent security vulnerabilities
symbolic-links = 0
EOF
            fi

            if [ "$PACKAGE" = "sonic" ]; then
                CONFIG_PATH="$CONF_DIR/$PACKAGE.cfg"
                # insert into boot script
                echo "sonic --config $CONFIG_PATH > /dev/null 2>> $LOGS_PATH/$PACKAGE.log " >> "$BOOT_SCRIPT"
                cat > "$CONFIG_PATH" <<EOF
# Sonic
# Fast, lightweight and schema-less search backend
# Configuration file
# Example: https://github.com/valeriansaliou/sonic/blob/master/config.cfg
# sonic --config config.cfg
[server]
log_level = "info"

[channel]
inet = "$BIND_IP:$PORT"
tcp_timeout = 300
auth_password = "$MASTER_PASSWORD"

[channel.search]
query_limit_default = 10
query_limit_maximum = 100
query_alternates_try = 4
suggest_limit_default = 5
suggest_limit_maximum = 20
list_limit_default = 100
list_limit_maximum = 500

[store]

[store.kv]
path = "$DATA_PATH/kv"
retain_word_objects = 1000

[store.kv.pool]
inactive_after = 1800

[store.kv.database]
flush_after = 900
compress = true
parallelism = 2
max_files = 100
max_compactions = 1
max_flushes = 1
write_buffer = 16384
write_ahead_log = true

[store.fst]
path = "$DATA_PATH/fst/"

[store.fst.pool]
inactive_after = 300

[store.fst.graph]
consolidate_after = 180

max_size = 2048
max_words = 250000
EOF
            fi

            if [ "$PACKAGE" = "nginx" ]; then
                CONFIG_PATH="$CONF_DIR/$PACKAGE.conf"
                # insert into boot script
                echo "nginx -c \$CONFIG_PATH" >> "$BOOT_SCRIPT"
                cat > "$CONFIG_PATH" <<EOF
# Nginx
# nginx -c config.cfg
worker_processes auto;
error_log $LOGS_PATH/$PACKAGE/error.log;
# pid /var/run/nginx.pid;
events {
    worker_connections 1024;
}

# #round robin   
# upstream backend {
#     server 127.0.0.1:3001;
#     server 127.0.0.1:3002;
# }
# #least_connections 
# upstream backend {
#     least_conn;
#     server 127.0.0.1:3001;
#     server 127.0.0.1:3002;
# }
# #ip hash
# upstream backend {
#     ip_hash;
#     server 127.0.0.1:3001;
#     server 127.0.0.1:3002;
# }
# #Weighted Load Balancing
# #Assigns different weights to servers, so servers with higher capacity handle more requests.
# upstream backend {
#     server 127.0.0.1:3001 weight=3;
#     server 127.0.0.1:3001;
# }

http {
    include         $PREFIX/etc/nginx/mime.types;
    default_type    application/octet-stream;
    log_format      main  '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                        '\$status \$body_bytes_sent "\$http_referer" '
                        '"\$http_user_agent" "\$http_x_forwarded_for"';
    access_log      $LOGS_PATH/$PACKAGE/access.log  main;
    sendfile        on;
    keepalive_timeout  65;
    upstream backend {
        ip_hash;
        server 127.0.0.1:3001;
        server 127.0.0.1:3002;
    }
    server {
        listen $PORT;
        server_name localhost;
        location / {
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        }
    }
}
EOF
            fi

            if [ "$PACKAGE" = "redis" ]; then
                CONFIG_PATH="$CONF_DIR/$PACKAGE.conf"
                # insert into boot script
                echo "redis-server \$CONFIG_PATH" >> "$BOOT_SCRIPT"
                cat > "$CONFIG_PATH" <<EOF
# Redis
# redis-server config.cfg

# Redis Configuration for Termux
# cp /data/data/com.termux/files/usr/etc/redis.conf ~/.config/redis/redis.conf

# redis-server ~/.config/redis/redis.conf
# redis-cli ping
# redis-server ~/.config/redis/redis.conf &

# Network settings
# bind 0.0.0.0 to listen from all anywhere

port $PORT # Listen only on localhost (change for remote access)
bind $BIND_IP  # Default Redis port

# Disable protected mode for external access (be careful)
protected-mode no

# Daemonize Redis (Run in background)
daemonize yes

# Log file
logfile "$LOGS_PATH/$PACKAGE.log"

# Database settings
save 900 1   # Save every 15 minutes if at least 1 change is made
save 300 100  # Save every 5 minutes if 10 changes are made
save 60 1500  # Save every 1 minute if 100 changes are made

# RDB file location
dir "$DATA_PATH/$PACKAGE/"

# Max memory usage (set based on available RAM)
maxmemory 100mb
maxmemory-policy allkeys-lru  # Eviction policy

# Enable Append-Only Mode for durability
appendonly yes
appendfilename "appendonly.aof"

# Enable password authentication (optional)
requirepass $MASTER_PASSWORD  # Change this to a strong password

# Enable Redis Cluster (optional)
# cluster-enabled yes
# cluster-config-file "nodes.conf"
# cluster-node-timeout 5000

EOF
            fi

            if [ "$PACKAGE" = "vector" ]; then
                CONFIG_PATH="$CONF_DIR/$PACKAGE.toml"
                # insert into boot script
                echo "vector --config $CONFIG_PATH" >> "$BOOT_SCRIPT"
                cat > "$CONFIG_PATH" <<EOF
# Vector

# Global configuration
data_dir = "$DATA_PATH/$PACKAGE/"

# Sources
[sources.nest_logs]
type = "socket"
address = "0.0.0.0:9000"
mode = "tcp"

# Transform: Parse log format
[transforms.parse_logs]
type = "remap"
inputs = ["file_logs"]
source = '''
. = parse_regex!(.message, r'^(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (?P<level>\w+) (?P<message>.*)$')
'''

# Sinks
[sinks.victoria_metrics]
type = "prometheus_remote_write"
inputs = ["system_metrics"]
endpoint = "http://localhost:8428/api/v1/write"

[sinks.zincsearch]
type = "http"
inputs = ["parse_logs"]
uri = "http://localhost:4080/api/default/_bulk"
method = "post"
encoding.codec = "json"

EOF
            fi

            if [ "$PACKAGE" = "victoriametrics" ]; then
                CONFIG_PATH="$CONF_DIR/$PACKAGE.yml"
                # insert into boot script
                echo "victoria-metrics -config.file=$CONFIG_PATH" >> "$BOOT_SCRIPT"

                cat > "$CONFIG_PATH" <<EOF
# Victoria Metrics
# Global settings
storageDataPath: "$DATA_PATH/$PACKAGE/"
retentionPeriod: "1y"

# HTTP server settings
httpListenAddr: ":8428"

# Scrape settings
promscrape:
  enabled: true
  config: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
      
    scrape_configs:
      - job_name: "vector"
        static_configs:
          - targets: ["localhost:8686"]
        
      - job_name: "node"
        static_configs:
          - targets: ["localhost:9100"]
# Search settings  
search:
  maxUniqueTimeseries: 1000000
  maxSeries: 30000

# victoria-metrics -config.file=~/victoriametrics.yml
# # Remote write settings
# remoteWrite:
#   - url: "http://localhost:8428/api/v1/write"

EOF
            fi
            
            if [ "$PACKAGE" = "zincsearch" ]; then
                CONFIG_PATH="$CONF_DIR/$PACKAGE.yaml"
                # insert into boot script
                echo "zincsearch --config $CONFIG_PATH" >> "$BOOT_SCRIPT"
                cat > "$CONFIG_PATH" <<EOF
# ZincSearch
# zincsearch --config config.yaml
server:
  port: $PORT
  address: "$BIND_IP"

data:
  path: "$DATA_PATH/$PACKAGE"
  storage_mode: "disk"

auth:
  admin_user: "$MASTER_USER"
  admin_password: "$MASTER_PASSWORD"

telemetry:
  enabled: false

search:
  min_score: 0.1
  highlight_tags:
    pre: "<mark>"
    post: "</mark>"

index:
  batch_size: 1000
  shard_num: 1
  settings:
    analysis:
      analyzer:
        default:
          type: "standard"
EOF
            fi
fi

    done < "$CONFIG_FILE"
}



chmod +x "$BOOT_SCRIPT"

if [ "$RUN_SERVICES" = "y" ]; then
    termux-wake-lock
    termux-setup-storage
    print_message "Running services on startup..." info
    "$BOOT_SCRIPT"
fi


# Verify Mariadb is running
print_message "Verifying Mariadb is running..." info
if mariadb-admin ping &>/dev/null; then
    echo "Mariadb is running successfully!" success
else
    echo "Mariadb failed to start. Check the script and logs." fail
fi


# Verify Zincsearch is running
print_message "Verifying Zincsearch is running..." info
if zincsearch --version &>/dev/null; then
    print_message "Zincsearch is running successfully!" success
else
    print_message "Zincsearch failed to start. Check the script and logs." fail
fi


# Verify Ollama is running
print_message "Verifying Ollama is running..." info
if ollama --version &>/dev/null; then
    print_message "Ollama is running successfully!" success
else
    print_message "Ollama failed to start. Check the script and logs." fail
fi


# Verify Nginx is running
print_message "Verifying Nginx is running..." info
if nginx -v &>/dev/null; then
    print_message "Nginx is running successfully!" success
else
    print_message "Nginx failed to start. Check the script and logs." fail
fi


# Verify Redis is running
print_message "Verifying Redis is running..." info
if redis-cli ping &>/dev/null; then
    print_message "Redis is running successfully!" success
else
    print_message "Redis failed to start. Check the script and logs." fail
fi


# Verify Vector is running
print_message "Verifying Vector is running..." info
if vector --version &>/dev/null; then
    print_message "Vector is running successfully!" success
else
    print_message "Vector failed to start. Check the script and logs." fail
fi


# Verify Sonic is running
print_message "Verifying Sonic is running..." info
if sonic --version &>/dev/null; then
    print_message "Sonic is running successfully!"
else
    print_message "Sonic failed to start. Check the script and logs."
fi


# create  user 'care@127.0.0.1' identified by 'password'
# create user for all domain
# create user 'dummy@%' identified by 'password'
# create tables
# grant privilege on care to 'care@localhost'
# # Start Victoria Metrics with config
# mkdir -p ~/.victoriametrics/data
# mv victoria-metrics.conf ~/.victoriametrics/
# victoria-metrics --config "\$CONF_DIR/victoria-metrics.conf" &
# Create boot script to run at Termux startup
# echo "ollama serve" >> ../bash.bashrc 
# ollama run qwen2.5-coder:0.5b
# ollama run deepscaler:1.5b-preview-q4_K_M
# sudo arp-scan  --localnet
# sudo nmap -sS -p- 192.168.97.47
# exposing 3306 & 4080 port if root access avaialable

print_message "Setup complete! Reboot your device to confirm automatic startup." info





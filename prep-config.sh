#!/bin/bash

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

read -rp "Enter master username(admin): " MASTER_USER
read -rp "Enter master password(admin): " MASTER_PASSWORD
read -rp "Where do you want to keep your data files 1) ~/xData 2) ~/../xData 3) on username (1 or 2 or 3) " PROD_DIR 


if [ "$PROD_DIR" = "1" ]; then
    PROD_DIR="$HOME/xData"
elif [ "$PROD_DIR" = "2" ]; then
    PROD_DIR="$HOME/../xData"
elif [ "$PROD_DIR" = "3" ]; then
    PROD_DIR="$HOME/$MASTER_USER"
else 
    print_message "Invalid choice" fail
    exit 1
fi

# I have created a directory in $HOME
mkdir -p "$PROD_DIR"

touch "$PROD_DIR/boot.sh"
touch ".env"
touch "$PROD_DIR/kill.sh"
ENV='.env'
SQL='initiate.sql'
KILL_SCRIPT="$PROD_DIR/kill.sh"
BOOT_SCRIPT="$PROD_DIR/boot.sh"

# Create directory in $HOME/../prod
CONF_DIR="$PROD_DIR/conf"
DATA_DIR="$PROD_DIR/data"
LOGS_DIR="$PROD_DIR/logs"
mkdir -p "$DATA_DIR"
mkdir -p "$CONF_DIR"
mkdir -p "$LOGS_DIR"

# Store all responses in a file inside the created directory
RESPONSE_FILE="$PROD_DIR/initiate.conf"
rm -f "$RESPONSE_FILE"
touch "$RESPONSE_FILE"
exec > >(tee -a "$RESPONSE_FILE") 2>&1

CONFIG_FILE="./pkgs.ini"

cat > "$ENV" <<EOF
DOMAIN="localhost"
PORT="3000"
ENV="main"
JWT_SECRET="verysupersecret" 
LOG_LEVEL="info" 
EOF

# Ensure required directories exist
mkdir -p "$CONF_DIR" "$DATA_DIR" "$LOGS_DIR"

# Function to read values from pkgs.ini
read_config() {
    local package=$1
    local key=$2
    awk -F '=' -v section="[$package]" -v key="$key" '
    $0 == section {found=1; next} 
    found && $1 == key {gsub(/^[ \t]+|[ \t]+$/, "", $2); print $2; exit}
    ' "$CONFIG_FILE"
}

print_message "Creating startup script..." info
# Function to update configs
update_configs() {
    PACKAGES=$(awk -F '[][]' '/\[.*\]/ {print $2}' "$CONFIG_FILE")

        for PACKAGE in $PACKAGES; do
            PORT=$(read_config "$PACKAGE" "port")
            BIND_IP=$(read_config "$PACKAGE" "bind_ip")
            # Read values from config file
            PORT=$(read_config "$PACKAGE" "port")
            BIND_IP=$(read_config "$PACKAGE" "bind_ip")
            # if BIND_IP ===0.0.0.0 then open firewall 
            if [ "$BIND_IP" = "0.0.0.0" ] && [ "$USE_ROOT_ACCESS" = "y"  ]; then
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
                #Copy old data
                # cp -r $PREFIX/var/lib/mysql/* $DATA_PATH
                # start fresh
                mysql_install_db --datadir=$DATA_PATH
                echo "mariadbd-safe --datadir=$DATA_PATH --log-error=$LOGS_PATH/error.log &" >> "$BOOT_SCRIPT"
                echo "pkill mariadb" >> "$KILL_SCRIPT"
                echo "MYSQL_URL=mysql://$MASTER_USER:$MASTER_PASSWORD@localhost:3306/neodrive" >>$ENV
                echo "CREATE USER IF NOT EXISTS \"$MASTER_USER\"@\"localhost\" IDENTIFIED BY \"$MASTER_PASSWORD\" ; " >> $SQL 
                echo "GRANT ALL PRIVILEGES ON neodrive.* TO '$MASTER_USER'@'localhost' ; " >>$SQL                
                
                cat > "$CONFIG_PATH" <<EOF
[mysqld]
# Basic Settings
port = $PORT

# Custom Database Directory
datadir = $DATA_PATH

# Logging
log-error = $LOGS_PATH/error.log
slow-query-log = 1
slow-query-log-file = $LOGS_PATH/slow.log
EOF
            fi

            if [ "$PACKAGE" = "sonicsearch" ]; then
                CONFIG_PATH="$CONF_DIR/$PACKAGE.cfg"
                
                # insert into boot script
                echo "sonic --config $CONFIG_PATH >> $LOGS_PATH/$PACKAGE.log & " >> "$BOOT_SCRIPT" 
                echo "pkill sonic" >> "$KILL_SCRIPT"
                echo "SONIC_HOST=\"localhost\"">> $ENV
                echo "SONIC_PORT=\"1491\"" >> $ENV
                echo "SONIC_PASSWORD=\"$MASTER_PASSWORD\"" >> $ENV
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
                echo "nginx -c $CONFIG_PATH &" >> "$BOOT_SCRIPT"
                echo "pkill nginx" >> "$KILL_SCRIPT"

                cat > "$CONFIG_PATH" <<EOF
# Nginx
# nginx -c config.cfg
worker_processes auto;
error_log $LOGS_PATH/error.log;
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
    access_log      $LOGS_PATH/access.log  main;
    sendfile        on;
    keepalive_timeout  65;
    upstream backend {
        ip_hash;
        server 127.0.0.1:3000;
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
                echo "redis-server $CONFIG_PATH" >> "$BOOT_SCRIPT"
                echo "pkill redis" >> "$KILL_SCRIPT"
                echo "REDIS_HOST=\"localhost\"" >> $ENV
                echo "REDIS_PORT=\"$PORT\"" >> $ENV

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
bind $BIND_IP
port $PORT 
# Listen only on localhost (change for remote access)
# Default Redis port

# Disable protected mode for external access (be careful)
protected-mode no

# Daemonize Redis (Run in background)
daemonize yes

# Log file
logfile $LOGS_PATH/$PACKAGE.log

# Database settings
save 900 1   
# Save every 15 minutes if at least 1 change is made
save 300 100 
# Save every 5 minutes if 10 changes are made
save 60 1500  
# Save every 1 minute if 100 changes are made

# RDB file location
dir $DATA_PATH/ 

# Max memory usage (set based on available RAM)
maxmemory 100mb
maxmemory-policy allkeys-lru  
# Eviction policy

# Enable Append-Only Mode for durability
appendonly yes
appendfilename "appendonly.aof"

# Enable password authentication (optional)
#requirepass $MASTER_PASSWORD  
# Change this to a strong password

# Enable Redis Cluster (optional)
# cluster-enabled yes
# cluster-config-file "nodes.conf"
# cluster-node-timeout 5000

EOF
            fi

            if [ "$PACKAGE" = "vector" ]; then
                CONFIG_PATH="$CONF_DIR/$PACKAGE.yaml"
                # insert into boot script
                echo "VECTOR_HOST=\"$BIND_IP\"" >>$ENV
                echo "VECTOR_PORT=\"$PORT\"" >>$ENV

                echo "vector --config $CONFIG_PATH > /dev/null 2>> $LOGS_PATH/$PACKAGE.log & " >> "$BOOT_SCRIPT"
                echo "pkill vector" >> "$KILL_SCRIPT"
                cat > "$CONFIG_PATH" <<EOF
# Vector

# Global configuration
data_dir: "$DATA_PATH/"

# Sources
sources:
  prod_logs:
    type: socket
    address: "$BIND_IP:$PORT"
    mode: "tcp"
    format: "json"

sinks:
  victoria_metrics:
    inputs: ["prod_logs"]
    type: http
    uri: http://localhost:9428/insert/jsonline?_stream_fields=host,container_name&_msg_field=message&_time_field=timestamp
    compression: gzip
    encoding:
      codec: json
    framing:
      method: newline_delimited
    healthcheck:
      enabled: false

  zincsearch:
    type: http
    inputs: ["prod_logs"]  # Input from the parsing/enrichment transform
    uri: "http://localhost:4080/api/default/_bulk"
    method: "post"
    encoding:
      codec: "json"

EOF
            fi

            if [ "$PACKAGE" = "victoria-metrics" ]; then
                CONFIG_PATH="$CONF_DIR/$PACKAGE.yml"
                # insert into boot script
                echo "victoria-metrics -storageDataPath $DATA_PATH -retentionPeriod=12 -maxConcurrentInserts=16 -search.maxQueryDuration=1m -httpListenAddr=:$PORT  > /dev/null 2>> $LOGS_PATH/$PACKAGE.log & " >> "$BOOT_SCRIPT"
                echo "pkill victoria-metrics" >> "$KILL_SCRIPT"

                cat > "$CONFIG_PATH" <<EOF
victoria-metrics -storageDataPath $DATA_PATH -retentionPeriod=12 -maxConcurrentInserts=16 -search.maxQueryDuration=1m -httpListenAddr=:$PORT
EOF
            fi
            
            if [ "$PACKAGE" = "zincsearch" ]; then
                CONFIG_PATH="$CONF_DIR/$PACKAGE.yaml"
                # insert into boot script
                
                echo "ZINC_FIRST_ADMIN_USER=$MASTER_USER ZINC_FIRST_ADMIN_PASSWORD=$MASTER_PASSWORD zincsearch --config $CONFIG_PATH > /dev/null 2>> $LOGS_PATH/$PACKAGE.log & " >> "$BOOT_SCRIPT"
                echo "ZINC_URL=\"http://127.0.0.1:$PORT\"" >>$ENV
                echo "ZINC_USER=\"$MASTER_USER\"" >> $ENV
                echo "ZINC_PASS=\"$MASTER_PASSWORD\"">> $ENV
                cat > "$CONFIG_PATH" <<EOF
# ZincSearch
# zincsearch --config config.yaml
server:
  port: $PORT
  address: "$BIND_IP"

data:
  path: "$DATA_PATH/"
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


    done 
}
echo "pkill noip-duc" >> "$KILL_SCRIPT"

echo "LEET_COOKIE=''" >> $ENV
echo "OLLAMA_URL='http://localhost:11434'" >> $ENV
echo "OLLAMA_MODEL='qwen2.5-coder:1.5b'" >> $ENV
#KaXQQxRhBzxs
echo "noip-duc -u tv9dbj8 -p KaXQQxRhBzx -g all.ddnskey.com > /dev/null 2>> $LOGS_DIR/noip.log & " >> "$BOOT_SCRIPT"
echo "sshd &" >> "$BOOT_SCRIPT"

update_configs

echo "figlet -f slant 'Termux'" >> ~/.bashrc


chmod +x "$BOOT_SCRIPT"
# cp $BOOT_SCRIPT $PROD_DIR/boot.sh



# Pending tasks 
# Hold liftbridge and fluent bit
# 1. Create build file for every package for latest version - done 
# 2. Create config for every package - done
# 3. Download packages from repo and ru - done
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
# mongodb on hold
# sudo nmap -sS -p- 192.168.97.47
# exposing 3306 & 4080 port if root access avaialable

print_message "Configuration completed." info

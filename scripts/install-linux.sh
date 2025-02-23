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

print_message "Updating and upgrading packages..." info
sudo apt update -y && apt upgrade -y
print_message "Installing necessary packages..." info
# sudo apt install tsu figlet openssh git curl tree wget nano nodejs termux-services iptables iproute2 nmap nginx arp-scan mariadb -y
for package in figlet curl tree wget nano iptables iproute2 nmap arp-scan net-tools openssh git nginx nodejs mariadb-server redis victoria-metrics  ; do
    if command -v "$package" &>/dev/null; then
        print_message "$package is already installed... Skipping..." skip
        continue
    fi
    if [ "$package" = "redis" ]; then
        if command -v redis-cli &>/dev/null; then
            print_message "Redis is already installed Skipping..." skip
            continue
        fi
    elif [ "$package" = "openssh" ]; then
        if command -v sshd &>/dev/null; then
            print_message "OpenSSH is already installed Skipping..." skip
            continue
        fi
    elif [ "$package" = "mariadb-server" ]; then
        if command --version mariadb &>/dev/null; then
            print_message "OpenSSH is already installed Skipping..." skip
            continue
        fi
    elif [ "$package" = "nodejs" ]; then
        if command -v node &>/dev/null; then
            print_message "Node.js is already installed Skipping..." skip
            continue
        fi
    elif [ "$package" = "iproute2" ]; then
        if command -v ip &>/dev/null; then
            print_message "iproute2 is already installed Skipping..." skip
            continue
        fi
    elif [ "$package" = "nmap" ]; then
        if command -v nmap &>/dev/null; then
            print_message "Nmap is already installed Skipping..." skip
            continue
        fi
    fi

    print_message "$package is not installed, installing..." info
    if sudo apt install "$package" -y; then
        print_message "$package installed successfully!" success
    else
        print_message "Failed to install $package" fail
    fi
done


ZINC_URL= https://github.com/zincsearch/zincsearch/releases/download/v0.4.10/zincsearch_0.4.10_Linux_x86_64.tar.gz
VECTOR_URL= https://packages.timber.io/vector/0.44.0/vector_0.44.0-1_amd64.deb
DUC_URL= https://www.noip.com/download/linux/latest

if vector --version &>/dev/null; then
    print_message "Vector is already installed Skipping... !" skip
else
    print_message "Installing Vector..." info
    wget -q "$VECTOR" -o vector.deb
    sudo dpkg -i vector.deb
    rm vector.deb
    print_message "Vector installed successfully!" success


    print_message "Installing ZincSearch ..." info
    wget -q "$ZINC_URL" -o - | tar -xvf - -C noi
    tar -xvf zincsearch_0.4.10_Linux_x86_64.tar.gz
    sudo chmod +x zincsearch
    sudo mv zincsearch /usr/local/bin/
    rm zincsearch_0.4.10_Linux_x86_64.tar.gz
    print_message "ZincSearch installed successfully!" success
    print_message "Installing DUC DDNS..." info

    wget -q "$NOIP_URL" -o - | tar -xvf - C noip-duc 
    ARCH= uname -i
    sudo chmod +x ./noip-duc/binaries/*amd64.deb
    sudo dpkg -i ./noip-duc/binaries/*amd64.deb
    print_message "DUC DDNS installed ..." info
    # wget -q "$url" -O - | tar -xvf - -C noip-duc

fi

print_message "Installed " success
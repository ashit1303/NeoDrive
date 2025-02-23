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

pkg update -y  && pkg install root-repo -y && pkg upgrade -y


print_message "Installing necessary packages..." info

# pkg install tsu figlet openssh git curl tree wget nano nodejs termux-services iptables iproute2 nmap nginx arp-scan mariadb -y
for package in figlet curl tree wget nano iptables msmtp arp-scan openssh git nginx nodejs mariadb redis iproute2 nmap arp-scan tsu ; do
    if command -v "$package" &>/dev/null; then
        print_message "$package is already installed... Skipping..." skip
        continue
    fi

    if [ "$package" = "redis" ]; then
        if command  redis-cli ping &>/dev/null; then
            print_message "Redis is already installed and running... Skipping..." skip
            continue
        fi
    elif [ "$package" = "mariadb-server" ]; then
        if command --version mariadb &>/dev/null; then
            print_message "OpenSSH is already installed Skipping..." skip
            continue
        fi
    elif [ "$package" = "openssh" ]; then
        if command -v sshd &>/dev/null; then
            print_message "OpenSSH is already installed and running... Skipping..." skip
            continue
        fi
    elif [ "$package" = "nodejs" ]; then
        if command -v node &>/dev/null; then
            print_message "Node.js is already installed and running... Skipping..." skip
            continue
        fi
    elif [ "$package" = "iproute2" ]; then
          if command -v ip &>/dev/null; then
              print_message "iproute2 is already installed and running... Skipping..." skip
              continue
          fi
      elif [ "$package" = "nmap" ]; then
          if command -v nmap &>/dev/null; then
              print_message "Nmap is already installed and running... Skipping..." skip
              continue
          fi
      fi

    print_message "$package is not installed, installing..." info
    if pkg install "$package" -y; then
        print_message "$package installed successfully!" success
    else
        print_message "Failed to install $package" fail
    fi
done

curl -L https://github.com/ashit1303/bash_scripts/releases/download/v1.0/aarch64.tar.xz -o aarch64.tar.xz
tar -xf aarch64.tar.xz
chmod +x aarch64/*
# Move all extracted files to $PREFIX/bin
mv -n aarch64/* "$PREFIX"/bin/

# Clean up
rm -rf aarch64 aarch64.tar.xz

echo 'PS1='\''\[\e[1;32m\]\u@\h:\[\e[0m\]\[\e[1;34m\]$(if [[ "$PWD" == "$HOME" ]]; then echo "~"; else echo "~${PWD#$HOME/}"; fi)\[\e[0m\]\$ '\'' ' >> ~/.bashrc
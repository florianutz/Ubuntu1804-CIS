Ubuntu 16.04 CIS STIG
================

[![Build Status](https://travis-ci.org/florianutz/Ubuntu1604-CIS.svg?branch=master)](https://travis-ci.org/florianutz/Ubuntu1604-CIS)
[![Ansible Role](https://img.shields.io/badge/role-florianutz.Ubuntu1604--CIS-blue.svg)](https://galaxy.ansible.com/florianutz/Ubuntu1604-CIS/)

Configure Ubuntu 16.04 machine to be CIS compliant. Level 1 and 2 findings will be corrected by default.

This role **will make changes to the system** that could break things. This is not an auditing tool but rather a remediation tool to be used after an audit has been conducted.

## IMPORTANT INSTALL STEP

If you want to install this via the `ansible-galaxy` command you'll need to run it like this:

`ansible-galaxy install -p roles -r requirements.yml`

With this in the file requirements.yml:

```
- src: https://github.com/florianutz/Ubuntu1604-CIS.git
```

Based on [CIS Ubuntu Benchmark v1.1.0 - 12-28-2017 ](https://community.cisecurity.org/collab/public/index.php).

This repo originated from work done by [MindPointGroup](https://github.com/MindPointGroup/RHEL7-CIS)

Requirements
------------

You should carefully read through the tasks to make sure these changes will not break your systems before running this playbook.

Role Variables
--------------
There are many role variables defined in defaults/main.yml. This list shows the most important.

**ubuntu1604cis_notauto**: Run CIS checks that we typically do NOT want to automate due to the high probability of breaking the system (Default: false)

**ubuntu1604cis_section1**: CIS - General Settings (Section 1) (Default: true)

**ubuntu1604cis_section2**: CIS - Services settings (Section 2) (Default: true)

**ubuntu1604cis_section3**: CIS - Network settings (Section 3) (Default: true)

**ubuntu1604cis_section4**: CIS - Logging and Auditing settings (Section 4) (Default: true)

**ubuntu1604cis_section5**: CIS - Access, Authentication and Authorization settings (Section 5) (Default: true)

**ubuntu1604cis_section6**: CIS - System Maintenance settings (Section 6) (Default: true)  

##### Disable all selinux functions
`ubuntu1604cis_selinux_disable: false`

##### Service variables:
###### These control whether a server should or should not be allowed to continue to run these services

```
ubuntu1604cis_avahi_server: false  
ubuntu1604cis_cups_server: false  
ubuntu1604cis_dhcp_server: false  
ubuntu1604cis_ldap_server: false  
ubuntu1604cis_telnet_server: false  
ubuntu1604cis_nfs_server: false  
ubuntu1604cis_rpc_server: false  
ubuntu1604cis_ntalk_server: false  
ubuntu1604cis_rsyncd_server: false  
ubuntu1604cis_tftp_server: false  
ubuntu1604cis_rsh_server: false  
ubuntu1604cis_nis_server: false  
ubuntu1604cis_snmp_server: false  
ubuntu1604cis_squid_server: false  
ubuntu1604cis_smb_server: false  
ubuntu1604cis_dovecot_server: false  
ubuntu1604cis_httpd_server: false  
ubuntu1604cis_vsftpd_server: false  
ubuntu1604cis_named_server: false  
ubuntu1604cis_bind: false  
ubuntu1604cis_vsftpd: false  
ubuntu1604cis_httpd: false  
ubuntu1604cis_dovecot: false  
ubuntu1604cis_samba: false  
ubuntu1604cis_squid: false  
ubuntu1604cis_net_snmp: false  
```  

##### Designate server as a Mail server
`ubuntu1604cis_is_mail_server: false`


##### System network parameters (host only OR host and router)
`ubuntu1604cis_is_router: false`  


##### IPv6 required
`ubuntu1604cis_ipv6_required: true`  


##### AIDE
`ubuntu1604cis_config_aide: true`

###### AIDE cron settings
```
ubuntu1604cis_aide_cron:
  cron_user: root
  cron_file: /etc/crontab
  aide_job: '/usr/sbin/aide --check'
  aide_minute: 0
  aide_hour: 5
  aide_day: '*'
  aide_month: '*'
  aide_weekday: '*'  
```

##### SELinux policy
`ubuntu1604cis_selinux_pol: targeted`


##### Set to 'true' if X Windows is needed in your environment
`ubuntu1604cis_xwindows_required: no`


##### Client application requirements
```
ubuntu1604cis_openldap_clients_required: false
ubuntu1604cis_telnet_required: false
ubuntu1604cis_talk_required: false  
ubuntu1604cis_rsh_required: false
ubuntu1604cis_ypbind_required: false
```

##### Time Synchronization
```
ubuntu1604cis_time_synchronization: chrony
ubuntu1604cis_time_Synchronization: ntp

ubuntu1604cis_time_synchronization_servers:
    - 0.pool.ntp.org
    - 1.pool.ntp.org
    - 2.pool.ntp.org
    - 3.pool.ntp.org  
```  

##### 3.4.2 | PATCH | Ensure /etc/hosts.allow is configured
```
ubuntu1604cis_host_allow:
  - "10.0.0.0/255.0.0.0"  
  - "172.16.0.0/255.240.0.0"  
  - "192.168.0.0/255.255.0.0"    
```  

```
ubuntu1604cis_firewall: firewalld
ubuntu1604cis_firewall: iptables
```


Dependencies
------------

Ansible > 2.2

Example Playbook
-------------------------

```
- name: Harden Server
  hosts: servers
  become: yes

  roles:
    - Ubuntu1604-CIS
```

Tags
----
Many tags are available for precise control of what is and is not changed.

Some examples of using tags:

```
    # Audit and patch the site
    ansible-playbook site.yml --tags="patch"
```

License
-------

MIT

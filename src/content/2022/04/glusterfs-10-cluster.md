---
title: How to create a simple storage cluster based on Glusterfs 10 and Ubuntu server 22.04 (Jammy)
short: Glusterfs 10 storage cluster on Ubuntu (Jammy)
description: Glusterfs is a distributed  storage, which you can use as storage in Kubernetes / Docker swarm orchestration systems
createdAt: 2022-04-06
category: devops
isDraft: false
slug: glusterfs-10-cluster
author: Yerlen Zhubangaliyev
email: yerlen@yerlen.com
pin: false
buymeacoffee: https://www.buymeacoffee.com/teamxg
linkedin: https://www.linkedin.com/in/yerlen-zhubangaliyev/
gitlab: https://gitlab.com/devnet.kz/
tags:
- devops
- glusterfs
- linux
- storage
image: /images/covers/glusterfs-logo.svg
license:
- by
- nc
language:
- en
- ru
---

Glusterfs is a distributed  storage, which you can use as storage in Kubernetes / Docker swarm orchestration systems.
It allows you to build fault-tolerant and scalable storage for your applications.

What we need:

* 3 virtual machines (192.168.1.11/24, 192.168.1.12/24, 192.168.1.13/24), that we will use as a server cluster storage
* 1 virtual machine (192.168.1.14/24), as a storage client

## Servers

Let's start by installing the glusterfs server on the cluster servers

```bash
sudo apt update && sudo apt install glusterfs-server -y
sudo systemctl start glusterd.service
sudo systemctl enable glusterd.service
```

Edit ``/etc/hosts`` on all VM's

```bash,[/etc/hosts]
192.168.1.11    glusterfs-server-01
192.168.1.12    glusterfs-server-02
192.168.1.13    glusterfs-server-03
```

On the first server, add 2 others VM's to the cluster by executing the following:

```bash
gluster peer probe glusterfs-server-02
gluster peer probe glusterfs-server-03
```

Let's check

```bash
gluster peer probe status
```

Output

```bash
Number of Peers: 2

Hostname: glusterfs-server-02
Uuid: bb5e609b-d99d-4d49-ae2f-af0879df7588
State: Peer in Cluster (Connected)

Hostname: glusterfs-server-03
Uuid: 88315bca-1b12-4aa2-acb3-8bcc812c85b0
State: Peer in Cluster (Connected)
```

On the first server, add a VOLUME of 3 cluster replicas

```bash
export VOLUME_NAME="my-volume"
export VOLUME_PATH="/glusterfs-storage"
gluster volume create $VOLUME_NAME transport tcp replica 3 glusterfs-server-01:$VOLUME_PATH glusterfs-server-02:$VOLUME_PATH glusterfs-server-03:$VOLUME_PATH force
```

And run VOLUME

```bash
gluster volume start $VOLUME_NAME
```

Let's check a status

```bash
gluster volume status
```

Output

```bash
Status of volume: my-volume
Gluster process                              TCP Port  RDMA Port  Online  Pid
-------------------------------------------------------------------------------
Brick glusterfs-server-01:/glusterfs-storage 58198     0          Y       972  
Brick glusterfs-server-02:/glusterfs-storage 51841     0          Y       931  
Brick glusterfs-server-03:/glusterfs-storage 52348     0          Y       919  
Self-heal Daemon on localhost                N/A       N/A        Y       989  
Self-heal Daemon on glusterfs-server-03      N/A       N/A        Y       936  
Self-heal Daemon on glusterfs-server-02      N/A       N/A        Y       949  
 
Task Status of Volume my-volume
-------------------------------------------------------------------------------
There are no active volume tasks
```

## Client

On the client machine, execute

```bash
sudo apt update && sudo apt install glusterfs-client
mkdir -p /storage
```

Mount filesystem

```bash
mount -t glusterfs glusterfs-server-01:/my-volume /storage
```

For permanent connection to the storage, at the end of ``/etc/fstab`` put the following and then execute ``sudo reboot``

```bash,[/etc/fstab]
glusterfs-server-01:/my-volume /storage glusterfs defaults,_netdev 0 0
```

Let's check

```bash
touch /storage/test.txt
```

And on storage VM's that Glusterfs works properly

```bash
ls -la /glusterfs-storage

total 24
drwxr-xr-x   4 root root 4096 Apr  6 15:15 .
drwxr-xr-x  20 root root 4096 Apr  6 14:33 ..
drw------- 262 root root 4096 Apr  6 14:39 .glusterfs
drwxr-xr-x   2 root root 4096 Apr  6 14:39 .glusterfs-anonymous-inode-f1845067-9924-4985-8a5b-a2063b186060
-rw-r--r--   2 root root    0 Apr  6 15:15 test.txt
```

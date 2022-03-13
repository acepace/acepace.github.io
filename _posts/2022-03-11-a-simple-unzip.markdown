---
layout: post
title:  "Unzipping a rather large archive"
date:   2022-03-13 20:00:03 +0200
categories: misc
---

# Speeding up an unzip operation

I assume this is common for atleast some of us. We download a large archive then want to decompress it, but store the results on a remote storage. There are many ways to do this but there's the constant question of what's faster. I decided to actually spend time checking this. What follows is a series of tests, none benchmarked properly but hopefully easy enough to replicate.

In our case, the input is a 7zip archive of 89.5 GB (96,200,220,672 bytes) with 1,350,408 files in 233,996 folders, whose uncompressed size is 324GB (324,656,867,839 bytes)

The archive file size distribution is as follows:

| size bucket |  number | 
|-------------|---------| 
| 1k          | 394652  | 
| 2k          | 197747  | 
| 4k          | 227758  | 
| 8k          | 217321  | 
| 16k         | 111806  | 
| 32k         | 68473   | 
| 64k         | 35078   | 
| 128k        | 26082   | 
| 256k        | 8918    | 
| 512k        | 10215   | 
| 1M          | 25691   | 
| 2M          | 11744   | 
| 4M          | 5697    | 
| 8M          | 5734    | 
| 16M         | 2814    | 
| 32M         | 535     | 
| 64M         | 100     | 
| 128M        | 24      | 
| 256M        | 6       | 
| 512M        | 10      | 
| 1G          | 3       | 


![alt_text]({{ site.url }}/images/unzip/filedistribution.png "File size distribution of the 90GB archive")
  
The archive starts out in a NAS and the host PC is a desktop connected over wired ethernet. 
The specifications are 
- NAS: Synology DS216+II with 4GB of RAM with a dual core Intel N3060 running at 1.6GHZ
- PC: Ryzen 9 5900X 12 core CPU with 32GB of RAM running Windows 11 build 22567


The different options benchmarked were:

1: Copy to PC + extract + copy back
2: Run 7z on PC targeting remote file share
3: Run 7z on the NAS
4: Copy to PC + extract + create a single file TAR + copy back + extract TAR on NAS

Obviously many parameters that should be considered were omitted, such as unrelated network traffic, other file IO happening on either disk at the same time, CPU usage, archive settings, compilation flags of 7z and probably many others. Each option took too long and so I didn't carefully rerun multiple times. However I still feel this is an interesting out of the box comparison.

For the purpose of honestly it's important to note that I initially guessed option 1 would be fastest, as it maximises what each component is good at. My partner guessed option 3, which explictly said the network overhead is too large.

tl;dr Option 3 was the fastest.

## Option 1 - Copy to PC + extract + copy back
The following commands were run or their GUI equivalent

```pwsh
Set-Service -Name "wsearch" -Status stopped
mkdir C:\tmp
Add-MpPreference -ExclusionPath C:\tmp
Set-MpPreference -DisableRealtimeMonitoring $True
Set-MpPreference -DisableScanningNetworkFiles $True
Set-MpPreference -DisableArchiveScanning $True
Measure-Command { robocopy "\\rekskuNAS\home\4150\source leaks\Samsung\" "C:\tmp\" "Samsung Electronic - part 1.7z" }
Measure-Command { 7z x "C:\tmp\Samsung Electronic - part 1.7z"}
Measure-Command { robocopy /MT /E /COMPRESS "C:\tmp\PR" "\\rekskuNAS\home\4150\source leaks\Samsung\PR"}
Set-Service -Name "wsearch" -Status start
Set-MpPreference -DisableArchiveScanning $False
Set-MpPreference -DisableRealtimeMonitoring $False
Add-MpPreference -ExclusionPath C:\tmp
```
Results are

```pwsh
Measure-Command { robocopy "\\rekskuNAS\home\4150\source leaks\Samsung\" "C:\tmp\" "Samsung Electronic - part 1.7z" }
Days              : 0
Hours             : 0
Minutes           : 14
Seconds           : 14
Milliseconds      : 633
Ticks             : 8546330170
TotalDays         : 0.00989158584490741
TotalHours        : 0.237398060277778
TotalMinutes      : 14.2438836166667
TotalSeconds      : 854.633017
TotalMilliseconds : 854633.017
```

Anecdotally, this totally saturated my network connection, reaching nearly 1gbps.

```pwsh
 Measure-Command { 7z x "C:\tmp\Samsung Electronic - part 1.7z" -oPR2}

Days              : 0
Hours             : 0
Minutes           : 18
Seconds           : 21
Milliseconds      : 674
Ticks             : 11016740655
TotalDays         : 0.0127508572395833
TotalHours        : 0.30602057375
TotalMinutes      : 18.361234425
TotalSeconds      : 1101.6740655
TotalMilliseconds : 1101674.0655
```

Anecdote, at no point did any of my CPU cores peg at 100% usage, nor did I ever really saturate the NVMe drive this was run on.
I wonder why, considering there was no AV to interfere. I doubt it's Windows as the IO downloading from the network was far faster.
```pwsh
Measure-Command { robocopy /MT /E /COMPRESS "C:\tmp\PR" "\\rekskuNAS\home\4150\source leaks\Samsung\PR"}
Days              : 0
Hours             : 2
Minutes           : 36
Seconds           : 9
Milliseconds      : 714
Ticks             : 93697148105
TotalDays         : 0.108445773269676
TotalHours        : 2.60269855847222
TotalMinutes      : 156.161913508333
TotalSeconds      : 9369.7148105
TotalMilliseconds : 9369714.8105
```

Total runtime was 188.767 minutes.
Anecdote, without enabling /MT, I barely passed the 1mbps mark. After enabling /MT, the bandwidth ranged from tens of mbps to nearly 1gbps. But this speed rarely if ever saturated the NASs CPU.

## Option 2 - Run 7z on PC targeting remote file share

Lets try to build an intuition for whats happening here behind the scenes. We are going to open a remote file and seek through it. We will be extracting files incrementally and writing them back one by one over the network. For performance there's two challenges, one is the amount of rapid and small network connections and the second is that network latency is far worse than local hard drive latency. Those two together should lead to really bad performance.

```pwsh
Set-MpPreference -DisableRealtimeMonitoring $True
Set-MpPreference -DisableScanningNetworkFiles $True
Set-MpPreference -DisableArchiveScanning $True
Measure-Command { 7z x "\\rekskuNAS\home\4150\source leaks\Samsung\Samsung Electronic - part 1.7z" -o"\\rekskuNAS\home\4150\source leaks\Samsung\extract1" }
Set-MpPreference -DisableArchiveScanning $False
Set-MpPreference -DisableScanningNetworkFiles $False
Set-MpPreference -DisableRealtimeMonitoring $False
```

The results are predictably bad.
```pwsh
 Measure-Command { 7z x "\\rekskuNAS\home\4150\source leaks\Samsung\Samsung Electronic - part 1.7z" -o"\\rekskuNAS\home\4150\source leaks\Samsung\extract1" }

Days              : 0
Hours             : 9
Minutes           : 18
Seconds           : 9
Milliseconds      : 604
Ticks             : 334896048385
TotalDays         : 0.387611167112269
TotalHours        : 9.30266801069445
TotalMinutes      : 558.160080641667
TotalSeconds      : 33489.6048385
TotalMilliseconds : 33489604.8385
```


## Option 3 - Run 7z on the NAS

This option minimizes data transfer by entirely omitting the network overhead. It's an explicit gamble that an underpowered CPU matched with two spinning hard disks will beat out the competition once a large amount of data transfer is omitted.

```bash

time /usr/bin/7z x -utf16 -bd -bb0 -aos -o"/volume1/homes/acepace/4150/source leaks/Samsung" -langenu "/volume1/homes/acepace/4150/source leaks/Samsung/Samsung Electronic - part 1.7z"
real    179m20.388s
user    147m37.396s
sys     19m15.143s
```

Anecdotally, the operation mostly saturated one of synology cores and hovered between 30 to 70 MB/s IO (read + write), when looking using htop. I didn't perform more exact measurements on the system load. However unlike other experiments I did run this one more than once and got different results.

| Run  | Time in minutes  |
|------|-----------------:|
| 1    | 179 minutes      |
| 2    | 193 minutes      |
| 3    | 192 minutes      |


## Option 4
The following commands were run or their GUI equivalent. Some artifacts were copied from prior options to save time.

```pwsh
Set-Service -Name "wsearch" -Status stopped
mkdir C:\tmp
Add-MpPreference -ExclusionPath C:\tmp
Set-MpPreference -DisableRealtimeMonitoring $True
Set-MpPreference -DisableScanningNetworkFiles $True
Set-MpPreference -DisableArchiveScanning $True
Measure-Command { robocopy "\\rekskuNAS\home\4150\source leaks\Samsung\" "C:\tmp\" "Samsung Electronic - part 1.7z" }
Measure-Command { 7z x "C:\tmp\Samsung Electronic - part 1.7z"}
Measure-Command { tar cf part1.tar "C:\tmp\PR" }
Measure-Command { robocopy /MT /E /COMPRESS "C:\tmp\" "\\rekskuNAS\home\4150\source leaks\Samsung\" part1.tar }
Start-Service -Name "wsearch"
Set-MpPreference -DisableArchiveScanning $False
Set-MpPreference -DisableRealtimeMonitoring $False
Set-MpPreference -DisableScanningNetworkFiles $False
Add-MpPreference -ExclusionPath C:\tmp
```

And on the server side
```bash
time tar --warning=no-unknown-keyword -xf part1.tar
```

Artifacts from prior options copied here for easier tracking

```pwsh
Measure-Command { robocopy "\\rekskuNAS\home\4150\source leaks\Samsung\" "C:\tmp\" "Samsung Electronic - part 1.7z" }
Days              : 0
Hours             : 0
Minutes           : 14
Seconds           : 14
Milliseconds      : 633
Ticks             : 8546330170
TotalDays         : 0.00989158584490741
TotalHours        : 0.237398060277778
TotalMinutes      : 14.2438836166667
TotalSeconds      : 854.633017
TotalMilliseconds : 854633.017

Measure-Command { 7z x "C:\tmp\Samsung Electronic - part 1.7z" -oPR2}

Days              : 0
Hours             : 0
Minutes           : 18
Seconds           : 21
Milliseconds      : 674
Ticks             : 11016740655
TotalDays         : 0.0127508572395833
TotalHours        : 0.30602057375
TotalMinutes      : 18.361234425
TotalSeconds      : 1101.6740655
TotalMilliseconds : 1101674.0655

Measure-Command { tar -cf part1.tar "C:\tmp\PR2" }
tar.exe: Removing leading drive letter from member names

Days              : 0
Hours             : 0
Minutes           : 14
Seconds           : 26
Milliseconds      : 185
Ticks             : 8661856156
TotalDays         : 0.0100252964768519
TotalHours        : 0.240607115444444
TotalMinutes      : 14.4364269266667
TotalSeconds      : 866.1856156
TotalMilliseconds : 866185.6156

Measure-Command { robocopy /MT /E /COMPRESS "C:\tmp\" "\\rekskuNAS\home\4150\source leaks\Samsung\" part1.tar }

Days              : 0
Hours             : 1
Minutes           : 9
Seconds           : 27
Milliseconds      : 926
Ticks             : 41679260806
TotalDays         : 0.0482398851921296
TotalHours        : 1.15775724461111
TotalMinutes      : 69.4654346766667
TotalSeconds      : 4167.9260806
TotalMilliseconds : 4167926.0806
```

And on the NAS side:
```bash
time tar --warning=no-unknown-keyword -xf part1.tar

real    78m46.011s
user    0m51.103s
sys     20m8.847s
```

## Benchmark results


| Option                                         | Time in minutes  |
|------------------------------------------------|-----------------:|
| Download, extract and upload                   | 188 minutes      |
| Extract streaming                              | 558 minutes      |
| Extract remotely                               | 179 minutes      |
| Download, extract, archive, upload and extract | 194 minutes      |

I have to admit the results surprised me. I expected the last option to be faster by quite a bit, as it performs the computational parts on a strong machine but the overhead of data movement, network and disk, made any improvement negigble. 

Note that the option that relied on the least amount of data movement won. Not by a lot but by enough to be note worthy.

In the interests of continuing this benchmark, I compared two additional large archives one weighing 32GB and another one of 73GB. However, these archives were not compressed, only packed together. This results in the following runtimes (all numbers in minutes)

| Size | Time |
|------|:----:|
| 90GB |  192 |
| 32GB |   9  |
| 73GB |  22  |

Note that with these runtimes it's clear that just downloading and uploading the data would be a waste of time. Clearly if it's not computationally heavy, the data transfer costs dominate. I also ran into technical issues that complicated trying option 4 "Download, extract, archive, upload and extract" on these files.
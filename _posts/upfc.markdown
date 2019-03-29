---
layout: post
title:  "What the bleep is UPFC.exe?"
date:   2019-01-26 17:55:03 +0200
categories: reverse-engineering windows
---

## What the bleep is UPFC.exe?

Every once in a while, I run procmon (Process Monitor) on boot, searching for new things that run as SYSTEM. This is a good technique to know what actually runs on your Windows computer and learn new stuff. Every time I do so, I run into something neat that lead me to discover a small new service in Windows. You can do the equivalent process using bootchart in Linux based systems. 

This time, I found a small service, named upfc.exe. I discovered this process is part of the Windows Update self healing mechanism. In this post I will describe the service, it's task and try to answer the question whether there exist any security issues in this service.

Discovery

Upon loading the procmon boot log, there is a huge deluge of data. To find interesting tidbits of information, I filter by _user name_ and _process start _and get going. After a _small _bit of scrolling I see upfc.exe, and I think what the heck?



![alt_text](images/UPFC0.png "image_tooltip")



![alt_text](images/UPFC1.png "image_tooltip")


What the heck is that and what does "Updateability from SCM" even mean? This happens very early in the boot process.

When faced with an unknown binary, a good search engine should be your first port of call. However, there are less than 400 results and none of them answer precisely what the executable does. There are hints that upfc.exe is part of the Windows Update process, but no explanation for it's role. 

The next step, was running _strings_ on the executable, hoping for some hints or a full answer. 

Running strings on the executable file provided no clear answers. A single string provided a strong clue, "_Microsoft-Windows-WaasMedic-Enable-Remediations_". From this string, we can assume that upfc.exe relates to "**Windows Update Medic Service** (WaaSMedicSVC)".

This  tells us what WaaSMedic relates to, Windows Update health check, but not what this executable actually does.

A few more strings give us pointers to related programs or services, such as sihclient.exe, or "antimalwareLight" that provide context on where when upfc fits in in the grand scheme of Windows. Strings like "antimalwareLight" provide context, for example, that upfc happens early in the boot process (but we knew that..) but again nothing helpful for understanding upfc itself.

Onwards to observe what the executable actually does when running. We can do this directly through procmon.

Looking at registry keys, we see upfc.exe accesses _Computer\HKEY_LOCAL_MACHINE\SYSTEM\WaaS_ and its sub keys _Upfc _and _WaaSMedic_. _Upfc _doesn't seem to have interesting values, most seem related to when it runs. 


![alt_text](images/UPFC2.png "image_tooltip")


UPFC registry values

But _WaaSMedic _sounds interesting. Without knowing anything about that particular service, the subkeys suggest there exists a mechanism for the WaaSMedic  service. 




![alt_text](images/UPFC3.png "image_tooltip")


Plugins implement different functionalities include checking executable file health (signatures and metadata), correctness of background scheduled tasks and services. 

But all this is can be talked about in a future blog post. Lets return to UPFC.


### Opening up UPFC

At some point, we need to open up the program in a disassembler. The main function of upfc.exe is very readable in IDA.

The rough pseudo code is as follows (omitting error checking and logging)



1. Check command line parameters
2. Check if another instance is in progress through the registry
    1. If so, quit
3. Mark that upfc is running through the registry
4. Call Upfc::PerformDetectionAndRemediationIfNeeded
5. Call Upfc::LaunchWaasMedicIfAllowed
6. Call Upfc::LaunchSihIfAllowed
7. Mark that upfc is not running

This is short and readable (besides the weird usage of the registry instead of a Mutex objet) and the core function is clearly Upfc::PerformDetectionAndRemediationIfNeeded.

This function does a few things



1. Check if the details of the windows service WaaSMedicSVC, match what's listed in a configuration file.

    



![alt_text](images/UPFC4.png "image_tooltip")


    

![alt_text](images/UPFC5.png "image_tooltip")



    Our service, upfc, compares each item in the XML file versus the matching registry value saved under _HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\WaaSMedicSvc_, looking for values that don't match. Keys checked include the name, the DLL to launch, the DACL covering the registry key, and so forth. A change in any of them can indicate a system malfunction or a security breach.


    The other files also describe Windows services relating to Windows Update. For the curious, the services covered by the XML files are BITS, Delivery Optimisation,WaaSMedic, Windows Update Agent, Trusted Installer and the Update Session Orchestrator Service. But UPFC only checks the state of WaaSMedic.

2. If the WaaSMedicSvc service is invalid for some reason, such as invalid registry settings, the upfc program recreates the service according to the XML file.


![alt_text](images/UPFC6.png "image_tooltip")


    In addition, it updates a telemetry provider with the changes it performed.


    


![alt_text](images/UPFC7.png "image_tooltip")



After Upfc::PerformDetectionAndRemediationIfNeeded runs, the main function may launch WaaSMedic and SiH, both external binaries.


#### Can we do anything with this?

Now that we understand the binary, we can think about the context in which it runs

To check for trivial security problems, I examined the ACLs on the configuration files and folders. This is an important check because if anyone could change these files, they could override services that run with SYSTEM privileges in Windows. 




![alt_text](images/UPFC8.png "image_tooltip")


ACL details for one of the files under C:\Windows\WaaS\services

Unsurprisingly, only TrustedInstaller and administrators can modify the configuration files describing the services. TrustedInstaller is a special built in user, used by Windows as a security feature to prevent Windows app folders and system files from being altered by users and malware.

These security settings mean that there are zero security concerns as anyone who can interfere with the ACLs guarding these files is already on the other side of the administration airlock.

However, if anyone changed these files, they'd have a nice persistent privilege escalation ability. Since upfc would consistently change the permissions and values for sensitive registry keys (such as what executable a system service would run), an attacker could modify one of the services to point at malicious binaries, allowing attackers to run code with SYSTEM permissions.

 \
And that was a fun hour of playing around :) At this point, we now understand one more small piece of the Windows Update process.

In future posts, I'll look into WaaSMedic and whether it truly has a plugin ability.

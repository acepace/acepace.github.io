---
layout: post
title:  "Gist on admin and kernel security boundaries"
date:   2019-09-30 10:55:03 +0200
categories: windows security history
tags: [windows, security, history]
---

A very quick background on a pair of tweets, uploading an answer I wrote over DMs

![twitter post]({{ site.url }}/images/dabah/dabah_signatures.png)

[Twitter link](https://twitter.com/_arkon/status/1178567438398570502)


A quick background on what the heck Alex is talking about

Vista introduced a new concept to Windows. That users should not constantly be running with full privileges. Most famously, using [UAC](https://en.wikipedia.org/wiki/User_Account_Control).

This was part of a thesis that the administrator was not to be trusted. Why? The administrator could be compromised using any of numerous security issues existing in the OS and that we need an additional gate between admin and total system compromise. 

Obviously, this thesis is problematic, as there are a many ways an administrator can take over a system regardless of how much the kernel prevents it. 
But it's part of the thesis behind Secure Boot, secure kernel, etc. etc.

Linux didn't really go for this. 

But as part of the whole "Linux is getting serious about security" over the last few years,
 there's been a patchset called lockdown. Whose idea is identical. 
 Let’s prevent root (UID 0) from changing basic configurations like boot parameters.
 
You can read more about this in the following LWN articles

1. [LWN link 1](https://lwn.net/Articles/514985/) (2012)-> Kinda intro. It's a one pager and mostly readable.
2. [LWN link 2](https://lwn.net/Articles/751061/) (2018) -> The idea is killed because it's basically security theater.
3. [LWN link 3](https://lwn.net/Articles/784674/) (2019) -> "Bring me back to life"

The thesis behind driver signatures is that running in kernel mode is effectively full control and we want to limit that.

In Win 64bit, starting from Vista, MS required all drivers be signed. Initially, just a code signing cert, then later, only Microsoft signed drivers.
So, for example, a security companies driver needs to be signed by Microsoft so it can run on non-developer systems.

This approach naturally removes the ability to just download and execute drivers "from the internet". The thesis was that attackers cannot easily get drivers signed and so users will be safer.

I think this thesis is attacked three times as security theater.
* It's "trivial" to get RCE in the Windows kernel so we can load arbitrary code. This thesis is getting weaker as more code execution protections are added to the kernel (HVCI and random mitigations)
* It's trivial to get a driver signed by MS by putting up a fake company and get MS to sign it. This will remain true but will remain the domain of large criminals or nation states.
* So many drivers are badly written that they can be abused by attackers trivially. A random example from the last month is the following [Twitter thread on Gigabytes GPU driver] (https://twitter.com/gsuberland/status/1175571371415560193)

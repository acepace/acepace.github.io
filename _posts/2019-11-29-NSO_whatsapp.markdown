---
layout: post
title:  "WhatsApp vs. NSO - A Technical Read of the Complaint"
date:   2019-11-30 10:55:03 +0200
categories: security history 
tags: [security, history, NSO, WhatsApp]
---

Note: This is a port of my twitter [thread](https://twitter.com/ace__pace/status/1189709559549616129?s=20)

At the end of October 2019, WhatsApp (owned by Facebook) sued NSO. The complaint covered multiple different legal attacks (including a reference to the [CFAA](https://en.wikipedia.org/wiki/Computer_Fraud_and_Abuse_Act)) but the technical exhibits consolidated a lot of public technical information on NSO that I thought was worth digging into.

Two exhibits - a user manual and a contract with Ghana - reveal quite a bit on NSOs system design and thinking. Unless labeled otherwise, screenshots are from the user manual and not the contract.

First off, the user manual describes the different attack methods available in Pegasus, NSO’s primary tool. The user manual mentions multiple attack methods such as over the air zero click, phishing messages, attacks over GSM abusing fake BTS (Base Transceiver Station) and physical attacks using data cables.


![Over-the-air attacks are what NSO vulnerabilities are famous for.]({{ site.url }}/images/NSO/NSO-writeup0.png)

![For many attacks, phishing is effective, if the victim is convinced to press on a link.]({{ site.url }}/images/NSO/NSO-writeup1.png)


![In cases where the government can use fake base stations or acquire physical access to the machine, NSO also has physical layer vulnerabilities.]({{ site.url }}/images/NSO/NSO-writeup2.png)



A common problem when attacking Android devices is device fragmentation. For many remote exploits, the attackers will have to customize the exploit for each platform. Also, every Android phone has its own quirks and bugs the developers have to work around. 


![Android fragmentation is an issue also for offensive programmers.]({{ site.url }}/images/NSO/NSO-writeup3.png)


![NSO doesn’t take the hard path and says they won’t support non Chromium based browsers.]({{ site.url }}/images/NSO/NSO-writeup4.png)


At the time, NSO specified up to 8 weeks to handle new target devices. I have a hard time believing this is the required timeframe, it’s likely a large buffer for HR reasons or because it takes time to acquire phones.




![This time scale isn’t very surprising for enterprise deployments.]({{ site.url }}/images/NSO/NSO-writeup5.png)


The tool itself has a laundry list of features. Like other mobile malware, Pegasus can silently activate the user’s microphone to listen in to passive communication.




![NSOs feature list also explicitly mentions the ability to silently activate the users microphone.]({{ site.url }}/images/NSO/NSO-writeup6.png)



Let’s skip ahead to the contract, which also contains technical information. Looking at the contract, at the time of this document, NSO did not know how to make their malware survive factory resets on iPhone, nor extract WhatsApp data from iPhones.


![At this time, the malware was far from all powerful and in some cases could be uninstalled just by running a factory reset.]({{ site.url }}/images/NSO/NSO-writeup7.png)


![Like many other malware, Pegasus extracts pretty much all information stored on the phone. SMSs, iMessage, call logs and more are all fair game.]({{ site.url }}/images/NSO/NSO-writeup8.png)


Last, their cellular ([SS7](https://en.wikipedia.org/wiki/Signalling_System_No._7)) capabilities deserve their own thread by experts. Their SS7 capability list reads like they explicitly allow for cases where control messages are sent across operator networks.


![At the time, SS7 capabilities were pretty rare.]({{ site.url }}/images/NSO/NSO-writeup9.png)


A serious problem for any mobile malware is sending the information home when a network connection is not available. Also, unlike PC malware, the phone’s battery life is very sensitive to network communication, as is the user’s phone bill (for some countries).

What Pegasus does is typical, it buffers information until the phone is near a rapid network, such as Wifi. If the buffer fills up before that time, the malware will override old data.



![NSOs collection buffer makes it clear that operators need to pick the data they collect carefully if the phone may be away from network access for large periods of time.]({{ site.url }}/images/NSO/NSO-writeup10.png)


Every good operator needs a way to hide communication traces. It's not clear how many hops NSO feels are required but probably more than one.


![It’s always nice when vendors invent fancy names for common tech. In this case, a chain of proxies in different geographical areas.]({{ site.url }}/images/NSO/NSO-writeup11.png)


Also, according to the contract, the client is responsible for their own operational security. The target may notice if the spying software ends up in their billing record.


![NSO takes care that Pegasus covers its tracks, but they absolve responsibility in case of operator mistakes/stupidity.]({{ site.url }}/images/NSO/NSO-writeup12.png)



I'm curious if NSO cares about android antivirus or they simply think to themselves: "whatever, they all suck".


![Malware typically kills itself when security software is detected or when it can’t reach its C2 server. Pegasus does both.]({{ site.url }}/images/NSO/NSO-writeup13.png)


The difference between most malware and commercial offerings is typically the UI and backend. NSOs user manual shows that it offers more than just a typical RAT control panel but also many sophisticated intelligence queries such as geo-fencing alerts and alerts on targets meeting up with each other.


![Backend analysis is just as important as collection and sometimes more important.]({{ site.url }}/images/NSO/NSO-writeup14.png)


Like other enterprise software, NSO provides an installation manual. I'm not surprised NSO specifies every last bit of their install process. Because as is common in the enterprise world, what isn’t defined is left up to chance. I’m sure they have customers who would try to cheap out on internet access and have no redundancy, or run the servers somewhere with bad electrical routing - leaving themselves open to sily failures that may expose them to their targets.



![Very strict system requirements make it clear that the Pegasus system isn’t small or simple, nor is it a simple C2 server.]({{ site.url }}/images/NSO/NSO-writeup15.png)


These requirements also extend to Opsec. Reading the contract, governments are encouraged to hide their tracks even when spying inside their own nation.



![Prepaid SIM cards are becoming a hassle to buy, maybe also for governments :)]({{ site.url }}/images/NSO/NSO-writeup16.png)


Moving on to the contract, NSO seems to be prepared for the Israeli Ministry of Defence unilaterally removing their export license.



![A unique problem for western offensive tool vendors is what happens if the government unilaterally revokes their export license.]({{ site.url }}/images/NSO/NSO-writeup17.png)


Along with technical restrictions on what countries you are allowed to target.



![When you buy from Israel - you buy Israel's legal restrictions]({{ site.url }}/images/NSO/NSO-writeup18.png)

I noted I would focus on technical information, but at the end, I should just mention - 25 devices at 8 million dollars feels like a steal.


![alt_text]({{ site.url }}/images/NSO/NSO-writeup19.png)


![alt_text]({{ site.url }}/images/NSO/NSO-writeup20.png)


In this case, we see the contract specifies a total of 25 concurrent implants. From other sources, NSO supports two methods of operation. One, as specified in this contract, allows for X number of concurrent malware implants. Another is a magazine metaphor, you are provided with N attacks you can use as you wish.

References:

*   [Whatsapp announcement](https://faq.whatsapp.com/help/video-calling-cyber-attack)


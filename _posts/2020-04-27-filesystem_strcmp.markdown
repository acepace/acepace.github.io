---
layout: post
title:  "PlaidCTF writeup - Filesystem based strcmp go brrr"
date:   2020-04-27 20:00:03 +0200
categories: reverse-engineering CTF misc
---


# PlaidCTF 2019 Everland - Writeup

I played with 5BC in the [PlaidCTF 2020](https://play.plaidctf.com/), playing mostly misc and reversing. This is a writeup of file-system-based strcmp go brrrr
, a misc challenge that consisted of a FAT32 file system image.


TL;DR The FAT filesystem implemented a DFA based regex engine hiding the flag, but you didn't need to understand any of that to solve it.

I will present 3 different solution, two of them "cheating"

# Solution 1


# Solution 2

This writeup was contributed by [@OphirHarpaz](https://twitter.com/OphirHarpaz).

Possible solution:

1. Get number of data clusters from the filesystem

        ubuntu@vm:~$ fatcat -i strcmp.fat32
        FAT Filesystem information
        
        Filesystem type: fat32
        OEM name: strcmp
        Total sectors: 66057
        Total data clusters: 65664

2. Get all **file entries** by enumerating all clusters and `grep`ping the entries that starts with `f`

        for i in {1..66000}
        do
        	fatcat strcmp.fat32 -L $i 2>/dev/null | grep '^f' >> file_names.txt
        done

    For some reason, this script gets stuck at 65538, but it still gets all important file names 🤷‍♂️

3. Fetch the **unique** file names

        ubuntu@vm:~$ cat file_names.txt | cut -d' ' -f5 | sort | uniq
        HAHA
        LOLNOPE
        MATCH
        NEGATORY
        NOFLAG4U
        NOMATCH
        NOPE
        SORRY
        TOOBAD
        TROLLOL

4. Find the file *MATCH* in *file_names* to see which cluster it starts in (answer is 1842)

        ubuntu@vm:~$ cat file_names.txt | grep MATCH
        f 1/1/1980 00:00:00  MATCH                          c=1842 s=0 (0B)
        f 1/1/1980 00:00:00  MATCH                          c=1842 s=0 (0B)
        f 1/1/1980 00:00:00  MATCH                          c=1842 s=0 (0B)
        ... # many more of these identical lines

5. Backtrack where the file *MATCH* is located by parsing the FAT (**HOW?!**)

    ❗ Parsing the FAT is a mistake, because it maps between files and clusters. We need to start from the file and backtrack its directory tree, so we actually need **directory table entries** and not FAT.

    So apparently... *fatcat* has a flag to do just that ("search for cluster reference").

        ubuntu@vm:~$ fatcat strcmp.fat32 -k 1842  # 1842 is MATCH's cluster

    At this point we notice that this cluster is "pointed to" by many files. So we can just `grep` for MATCH:

        ubuntu@vm:~$ fatcat -k 1842 strcmp.fat32 | grep '\bMATCH'
        Found /SPACE/SPACE/!/SPACE/!/SPACE/SPACE/SPACE/!/#/P/C/P/C/P/C/T/F/{/P/C/P/C/T/F/{/P/C/T/F/{/W/H/A/T/_/I/N/_/T/A/R/N/A/T/I/O/N/_/I/S/_/T/H/1/S/_/F/I/L/E/S/Y/S/T/E/M/!/}/MATCH in directory } (1638)
        f 1/1/1980 00:00:00  MATCH                          c=1842 s=0 (0B)

    The flag is right there after a bit of sanitization.

# Solution 3


I hope you had fun reading far too many words relating
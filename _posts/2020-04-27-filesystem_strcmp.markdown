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

I will present 2 different solution, both  "cheating" and missing the point.

# Solution 1

Looking at the drive using [fatcat](https://github.com/Gregwar/fatcat), we can see that multiple folder listings point to the same cluster entry, along with a single size 0 file.

    acepace@Ace-XPS:~$ fatcat -l / strcmp.fat32
    Listing path /
    Directory cluster: 2
    d 1/1/1980 00:00:00  SPACE/ (SPACE)                                     c=758
    d 1/1/1980 00:00:00  !/ (!)                                             c=1406
    d 1/1/1980 00:00:00  #/ (#)                                             c=1618
    d 1/1/1980 00:00:00  $/ ($)                                             c=1254
    d 1/1/1980 00:00:00  %/ (%)                                             c=1406
    d 1/1/1980 00:00:00  &/ (&)                                             c=1618
    d 1/1/1980 00:00:00  '/ (')                                             c=1282
    d 1/1/1980 00:00:00  (/ (()                                             c=758
    d 1/1/1980 00:00:00  )/ ())                                             c=782
    d 1/1/1980 00:00:00  -/ (-)                                             c=1238
    d 1/1/1980 00:00:00  0/ (0)                                             c=758
    d 1/1/1980 00:00:00  1/ (1)                                             c=450
    d 1/1/1980 00:00:00  2/ (2)                                             c=782
    d 1/1/1980 00:00:00  3/ (3)                                             c=1282
    d 1/1/1980 00:00:00  4/ (4)                                             c=1406
    d 1/1/1980 00:00:00  5/ (5)                                             c=782
    d 1/1/1980 00:00:00  6/ (6)                                             c=1406
    d 1/1/1980 00:00:00  7/ (7)                                             c=1254
    d 1/1/1980 00:00:00  8/ (8)                                             c=546
    d 1/1/1980 00:00:00  9/ (9)                                             c=758
    d 1/1/1980 00:00:00  @/ (@)                                             c=1238
    d 1/1/1980 00:00:00  A/ (A)                                             c=890
    d 1/1/1980 00:00:00  B/ (B)                                             c=890
    d 1/1/1980 00:00:00  C/ (C)                                             c=758
    d 1/1/1980 00:00:00  D/ (D)                                             c=1406
    d 1/1/1980 00:00:00  E/ (E)                                             c=782
    d 1/1/1980 00:00:00  F/ (F)                                             c=1254
    d 1/1/1980 00:00:00  G/ (G)                                             c=758
    d 1/1/1980 00:00:00  H/ (H)                                             c=1406
    d 1/1/1980 00:00:00  I/ (I)                                             c=1566
    d 1/1/1980 00:00:00  J/ (J)                                             c=782
    d 1/1/1980 00:00:00  K/ (K)                                             c=1282
    d 1/1/1980 00:00:00  L/ (L)                                             c=546
    d 1/1/1980 00:00:00  M/ (M)                                             c=546
    d 1/1/1980 00:00:00  N/ (N)                                             c=1238
    d 1/1/1980 00:00:00  O/ (O)                                             c=450
    d 1/1/1980 00:00:00  P/ (P)                                             c=1802
    d 1/1/1980 00:00:00  Q/ (Q)                                             c=782
    d 1/1/1980 00:00:00  R/ (R)                                             c=890
    d 1/1/1980 00:00:00  S/ (S)                                             c=758
    d 1/1/1980 00:00:00  T/ (T)                                             c=1282
    d 1/1/1980 00:00:00  U/ (U)                                             c=546
    d 1/1/1980 00:00:00  V/ (V)                                             c=890
    d 1/1/1980 00:00:00  W/ (W)                                             c=1618
    d 1/1/1980 00:00:00  X/ (X)                                             c=758
    d 1/1/1980 00:00:00  Y/ (Y)                                             c=758
    d 1/1/1980 00:00:00  Z/ (Z)                                             c=890
    d 1/1/1980 00:00:00  ^/ (^)                                             c=782
    d 1/1/1980 00:00:00  _/ (_)                                             c=546
    d 1/1/1980 00:00:00  `/ (`)                                             c=450
    d 1/1/1980 00:00:00  {/ ({)                                             c=450
    d 1/1/1980 00:00:00  }/ (})                                             c=890
    f 1/1/1980 00:00:00  SORRY                                              c=1842 s=0 (0B)


At this point, we verify that the folders are just as absurd as we can see by looking at one of the specific paths.

    acepace@Ace-XPS:~$ fatcat -l /W strcmp.fat32
    Listing path /W
    Directory cluster: 1618
    d 1/1/1980 00:00:00  SPACE/ (SPACE)                                     c=890
    d 1/1/1980 00:00:00  !/ (!)                                             c=1238
    d 1/1/1980 00:00:00  #/ (#)                                             c=782
    d 1/1/1980 00:00:00  $/ ($)                                             c=782
    ...
    ...
    f 1/1/1980 00:00:00  NOPE                                               c=1842 s=0 (0B)


However we note that the single file points at the exact same entry.

At this point, your spidy-misc sense should be tingling that the file may be interesting. At this point, we'll use an awesome feature of `fatcat`.

A tiny line in the `fatcat` manual states
`You can use -k to search for a cluster reference.`

    fatcat -k 1842 strcmp.fat32

Gives us a long list of results, among them

    Found /SPACE/SPACE/!/SPACE/!/SPACE/SPACE/SPACE/!/#/P/C/P/C/P/C/T/F/{/P/C/P/C/T/F/{/P/C/T/F/{/W/H/A/T/_/I/N/_/T/A/R/N/A/T/I/O/N/_/I/S/_/T/H/1/S/_/F/I/L/E/S/Y/S/T/E/M/!/}/SPACE/SPACE/SPACE/!/SORRY in directory ! (858)
Notice the `PCTF{` bit in the middle? One minute with notepad++ and we get the flag.

# Solution 2

This writeup was contributed by [@OphirHarpaz](https://twitter.com/OphirHarpaz).

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


# End
I hope you had fun reading far too many words relating to how we cheated our way through a filesystem built by [regex2fat](https://github.com/8051Enthusiast/regex2fat).

The correct solution involved understanding that the MATCH file is the correct solution and probably parsing the file system tree till we find it.

Some pointers in that direction would be that the MATCH file was found in a specific directory listing of `}` that was different from other `}` directories.

Thank you to [8051Enthusiast](https://twitter.com/8051Enthusiast) for writing such an absurd library and to whoever wrote the challenge.
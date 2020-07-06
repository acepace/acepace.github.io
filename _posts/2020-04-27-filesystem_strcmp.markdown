---
layout: post
title:  "PlaidCTF writeup - Filesystem based strcmp go brrr"
date:   2020-04-26 20:00:03 +0200
categories: CTF misc
---


# PlaidCTF 2019 Filesystem based strcmp go brrr - Writeup

I played with [5BC](https://ctftime.org/team/42318) in the [PlaidCTF 2020](https://play.plaidctf.com/), playing mostly misc and reversing. This is a writeup of `file-system-based strcmp go brrrr`, a misc challenge that consisted of a FAT32 file system image.

TL;DR Someone implemented a  DFA based regex engine on top of the FAT filesystem to hide a flag, but you didn't need to understand any of that to solve it.

I will present 2 different solution, both "cheating" and missing the point.

# The challenge

Mounting the file system gives us nothing useful. The root directory is composed of multiple one character directories and a single 0 byte file named SORRY

    acepace@Ace-XPS:~$ ls /mnt/ctf
    `  _  !  (  {  @  &  %  1  3  5  7  9  B  D  F  H  J  L  N  P  R  SORRY T  V  X  Z
    ^  -  '  )  }  $  #  0  2  4  6  8  A  C  E  G  I  K  M  O  Q  S  SPACE  U  W  Y

Checking a sample of the subdirectories gives us similar directory listings with a single 0 size file.


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

Parts of this writeup was contributed by [@OphirHarpaz](https://twitter.com/OphirHarpaz). We believe this is what the challenge author intended.

Get all **file entries** by enumerating all clusters and `grep`ping the entries that starts with `f`

        for i in {1..66000}
        do
        	fatcat strcmp.fat32 -L $i 2>/dev/null | grep '^f' >> file_names.txt
        done

Fetch the **unique** file names

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

We can notice the MATCH file and guess it may be relevant to us.

At this point, we want to find what folder contains that specific file file, hoping it will improve our situation.

In this case, we can automate this using `fatcat` JSON output format and `jq`.

    for i in {1..66000}; do fatcat strcmp.fat32 -L $i -F json 2>/dev/null | jq 'if (.Entries[] | select(.Name == "MATCH")) then .Cluster else "" end'; done
    
At this point we want to lookup references to these directory entries. We again turn to our trusty sidekick `-k` and the following fun command line

    for i in {1..66000}; do fatcat strcmp.fat32 -L $i -F json 2>/dev/null | jq 'if (.Entries[] | select(.Name == "MATCH")) then .Cluster else "" end' | xargs --no-run-if-empty fatcat strcmp.fat32 -k ; done
    
Note the `--no-run-if-empty` passed to `xargs`.

If we run this for a minute, we magically get the **correct** solution

    Searching for an entry referencing 1638 ...
    Found /SPACE/SPACE/!/SPACE/!/SPACE/SPACE/SPACE/!/#/P/C/P/C/P/C/T/F/{/P/C/P/C/T/F/{/P/C/T/F/{/W/H/A/T/_/I/N/_/T/A/R/N/A/T/I/O/N/_/I/S/_/T/H/1/S/_/F/I/L/E/S/Y/S/T/E/M/!/} in directory ! (902)

A minute of notepad++ and we're + 150 points.

# End
I hope you had fun reading far too many words relating to how we cheated our way through a filesystem built by [regex2fat](https://github.com/8051Enthusiast/regex2fat).

The correct solution involved understanding that the MATCH file is the correct solution and probably parsing the file system tree till we find it.

Some pointers in that direction would be that the MATCH file was found in a specific directory listing of `}` that was different from other `}` directories.

Thank you to [8051Enthusiast](https://twitter.com/8051Enthusiast) for writing such an absurd library and to whoever wrote the challenge.
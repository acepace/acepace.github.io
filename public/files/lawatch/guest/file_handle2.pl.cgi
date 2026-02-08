#!/usr/local/bin/perl
print "Content-type:text/html\n\n";
read(STDIN, $buffer, $ENV{'CONTENT_LENGTH'});
@pairs = split(/&/, $buffer);
foreach $pair (@pairs) {
    ($name, $value) = split(/=/, $pair);
    $value =~ tr/+/ /;
    $value =~ s/%([a-fA-F0-9][a-fA-F0-9])/pack("C", hex($1))/eg;
    $FORM{$name} = $value;
}


open (OUTF,">>submited2.html");
print OUTF "<font size=2> \n";
print OUTF "<b>Name:</b> $FORM{'name'} <br>\n";
print OUTF "<b>Reply Email:</b> $FORM{'mail'} <br>\n";
print OUTF "<b>-------------------------------</b><br>\n";
print OUTF "$FORM{'comment'} <br>\n";
print OUTF "<hr>\n";




close (OUTF);

print "<html><head>\n";
print "<meta http-equiv=\"refresh\" content=\"1 ;URL=http://lawatch.haifa.ac.il/guest/submited2.html\">\n";
print "</head></html>";

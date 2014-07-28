#!C:\xampp\perl\bin\perl.exe
#
#
use strict;
use CGI;

# Read form data etc.
my $cgi = new CGI;

# The results from the high score script will be in plain text
print $cgi->header("text/plain");

my $file = $cgi->param('file');
my $data = $cgi->param('data');

exit 0 unless $file; # This parameter is required
exit 0 unless $data; # This parameter is required

if(-d "logs"){
    open  (MYLOG, ">>logs/$file") || die "$!";
    print MYLOG "$data\n";
    close (MYLOG);
}
else{
    mkdir("logs");
    open  (MYLOG, ">>logs/$file") || die "$!";
    print MYLOG "$data\n";
    close (MYLOG);
}

print "done";
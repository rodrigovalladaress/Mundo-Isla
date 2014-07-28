#!C:\xampp\perl\bin\perl.exe
# The SQL database needs to have a table called autentication
# that looks something like this:
#
#   CREATE TABLE autentication (
#     user varchar(255) NOT NULL,
#     password varchar(255) NOT NULL
#   );
#
use strict;
use CGI;
use DBI;

# Read form data etc.
my $cgi = new CGI;

# The results from the high score script will be in plain text
print $cgi->header("text/plain");

my $User = $cgi->param('user');
my $Password = $cgi->param('password');

exit 0 unless $User; # This parameter is required

# Connect to a database
my $dbh = DBI->connect( 'DBI:mysql:unity', 'unity', 'dharma' )
    || die "Could not connect to database: $DBI::errstr";

# Fetch the high scores
my $sth = $dbh->prepare(
    "SELECT user, password FROM autentication WHERE user = '$User'" );
$sth->execute();
while (my $r = $sth->fetchrow_arrayref) {
    if ( $$r[1] eq $Password ){
	    print "true";
	}
	else{
	    print "false";
	}	  
}
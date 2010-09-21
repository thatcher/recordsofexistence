#!/bin/sh
alias js="\
    java -cp WEB-INF/lib/js.jar:WEB-INF/lib/jline.jar \
    jline.ConsoleRunner org.mozilla.javascript.tools.shell.Main -opt -1"
   
alias jsd="\
    java -cp WEB-INF/lib/js.jar:WEB-INF/lib/jline.jar \
    jline.ConsoleRunner org.mozilla.javascript.tools.debugger.Main"
        
if [ "shell" == "$1" ]; then 

    echo "Entering interactive shell, please js> load('bin/command.js');"
    js
    
else 
    
    if [ "debug" == "$1" ]; then
        echo "Debug Mode Enabled"
        jsd `echo bin/$2.js` $3 $4 $5 $6 $7 $8 $9
    else
        js `echo bin/$1.js` $2 $3 $4 $5 $6 $7 $8 $9
    fi
    
fi


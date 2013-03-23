# NODE APPLICATION MANAGER

`nam`

## EXPECTATIONS

1. `npm pack` tarball structure is how you unpack your application
   1. all files are in the `/package` prefix
   
## CONFIG

--userconfig
--globalconfig

## ENV SCAFFOLDING

```
$APPROOT ($HOME)
  /bin (in $PATH)
  /lib (for shared libs, added automatic in `run` task)
  /include (for headers, added automatic in `run` task)
  /tmp ($TMPDIR)
  /build
    /package ($PWD)
```
   
## INTEGRATIONS

All of name is done via integrations.
It will never try to load them unless specified.

```
# checkout a new "empty" application
nam -i checkout -- checkout --empty
```

```
# run a command against your application
nam run -- npm start
```

```
# checkout and run all in one!
printf '[["checkout"],["run",["ls",".."]]]' | ../bin/nam -i checkout --task.checkout.empty true
```

## Usage

`nam -i integration -- task`
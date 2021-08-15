# AWS EC2 Manager
### A simple tool to start and stop your instances from the command line.

**Setup**
Setup is simple, just clone the repo, run `npm install` in the project directory and then create your .env file.

The .env file should look like this
```
ACCESS_KEY=IAMACCESSKEY
SECRET_KEY=IAMSECRETKEY
REGION=ap-southeast-2
```

Just insert the relevant keys that can be found at [IAM Management Console](https://console.aws.amazon.com/iamv2/home#/users) under the **Security credentials** tab for the user you want to use.

And finally, insert the region code that contains your instances.
It may be necessary to fork the project if you need to support more regions.

**Your instance MUST have a `Name` key associated with it for this program to work.**

The typical output for this program will look like this
```
EC2 Instance Manager by Matthew Scott
Listing all instances.
[0] My First Instance (i-0f665341c5ae579ce) - stopped
[1] My Second Instance (i-0f661241c5a5459ce) - started
✔ Instance to toggle: … 0
Selected My First Instance (i-0f665341c5ae579ce).
Instance entering state pending.
Please wait...
Instance state successfully changed to running.
```

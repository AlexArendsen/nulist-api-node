# NuList NodeJS POC Back-End

A really simple Node back-end for NuList, a productivity tool that allows you
to keep recursive checklists. Check out `nulist-app-angular` for my Angular 6+
font-end for this project!

## Design Highlights

I designed this back-end to be super simple and modern -- the kind of code I
love to work on. It runs on the **Restify** framework.

The initial implementation used an on-disk database (via **DiskDB**). The
database interactions are abstracted to separate code in the `database/`
directory a la **respository pattern**, which allowed me to seamlessly
transition to a **MongoDB** persistence service while leaving the driver and
contoller code unchanged.

As of August 28, 2018, I am hosting this app for free on the wonderful
[Now.sh](https://now.sh) by Zeit. If you don't know about `now`, you should
absolutely check it out.

## Running

Run `npm run start` to get going. Currently configured to run with the Angular
6 front-end app, compiled to `app-ng6` in the root of the project.

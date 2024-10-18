
# Taskrr 

✨ **A simple task management tool that uses NextJs as a client and BE proxy to a grpc Java service.** ✨  

NexJs Client -> Nextjs Service ( REST- acting as a proxy ) -> Java BE (grpc)

## Tech Stack 🔨

 - Spring Boot
 - Next.JS 13
 - gRPC
 - TailwindCSS
 - Postgres

## Setting up 🔧
* Postgres 16 https://www.postgresql.org/
	* Default user for postgres should be username `postgres` password `root`. ( if they are set up differently you can change the config in `application.properties`
	* Create a DB called `taskrrdb`
	* Open the java project in the preferred IDE and run `maven install`
	* Run `maven compile` to generate the grpc interfaces and models from the `proto` files. `Proto` files are located in the proto folder inside the java folder.
* Nodejs v.20 ( 20.13.1 ) https://nodejs.org/en
* Java 17

## Start the app 🚀
* Open the UI project and run `npm install` to install the needed dependencies.
* After that run `npm run prepare:grpc` and `npm run generate:grpc` to generate the TS interfaces and services from the proto files.
* Check `.env.local` file and change the url address of the running grpc service ( if necessary - default port is 9090 )
* Start he Java project 
* Start the nextjs project ( `npm run dev` )

## Functionalities ⚡
* Firstly, create an account by visiting `localhost:(3000)/register`
* Login from `localhost:(3000)/login`
* You will be redirected to the dashboard page
* From the dashboard page you can either `logout` , `preview your current boards` or `create a new board`
* Clicking a board will present the board details screen. From there you can create tasks, assign statuses to those tasks and delete them
* You can also delete the boards

# UGRacing - Simulated CAN Environment
The purpose of this repository is the development of UGRacing's simulated CAN environment. The reason for this to be made is for testing the upcoming regenerative braking system of the vehicle. This system will allow us to connect an ESP32 microcontroller to our existing CAN network(s) and diagnose any issues as well as test numerous and complex environments our powertrain will be in.

## User Input
User input will all be handled using a web interface. The idea is that the ESP32 will act as an access point serving the relevant HTML, JS, CSS files required for manipulating the environment. The user interface will manipulate the environment via the use of HTTP get and post requests. As such, the ESP32 also runs an API server.

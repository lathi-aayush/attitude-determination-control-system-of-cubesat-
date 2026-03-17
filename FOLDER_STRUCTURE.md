# AarambhSat ADCS – Folder Structure

```
ADCS/
├── docs/
│   ├── ARCHITECTURE.md    # System architecture diagram and responsibilities
│   ├── PROTOCOL.md       # Command language and telemetry format
│   └── WEBSOCKET_FLOW.md # WebSocket message formats and flow
│
├── firmware/
│   └── AarambhSat_ADCS/
│       ├── AarambhSat_ADCS.ino   # Main Arduino sketch (Bluetooth + commands + telemetry)
│       └── README.md             # Wiring and library notes
│
├── backend/
│   ├── package.json      # Node.js deps: express, serialport, ws, parser-readline
│   └── server.js         # HTTP + WebSocket server, serial bridge
│
├── web/
│   ├── index.html        # Single-page control UI
│   ├── styles.css        # Exhibition-friendly dark theme
│   └── app.js            # WebSocket client, port list, send command, telemetry display
│
├── README.md             # Project overview, setup, testing, deployment
├── SETUP_GUIDE.md        # Step-by-step setup
├── TESTING.md            # Testing procedure
├── EXHIBITION_DEPLOYMENT.md  # Exhibition deployment instructions
└── FOLDER_STRUCTURE.md   # This file
```

## Notes

- **Backend** serves `web/` as static files and mounts WebSocket at `/ws`.
- **Arduino** sketch is intended to be used with the same hardware/repo as [attitude-determination-control-system-of-cubesat](https://github.com/lathi-aayush/attitude-determination-control-system-of-cubesat); only the firmware folder here is the extended exhibition firmware.

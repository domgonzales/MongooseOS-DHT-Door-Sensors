let RPC = {
  _strdup: ffi('void *strdup(char *)'),
  _addHandler: ffi('void *mgos_rpc_add_handler(void *, void (*)(void *, char *, char *, userdata), userdata)'),
  _sendResponse: ffi('bool mgos_rpc_send_response(void *, char *)'),
  _call: ffi('bool mgos_rpc_call(char *, char *, char *, void (*)(char *, int, char *, userdata), userdata)'),

  _ahcb: function(ri, args, src, ud) {
    let resp = ud.cb(JSON.parse(args || 'null'), src, ud.ud);
    RPC._sendResponse(ri, JSON.stringify(resp));
    // NOTE: we don't call ffi_cb_free here because this handler might be used
    // more than once
  },

  _ccb: function(res, code, msg, ud) {
    ud.cb(res ? JSON.parse(res) : null, code, msg, ud.ud);
    ffi_cb_free(RPC._ccb, ud);
  },

  LOCAL: "RPC.LOCAL",

  // ## **`RPC.addHandler(name, handler)`**
  // Add RPC handler. `name` is a string like `'MyMethod'`, `handler`
  // is a callback function which takes `args` arguments object.
  //
  // Return value: none.
  //
  // Example:
  // ```javascript
  // RPC.addHandler('Sum', function(args) {
  //   return args.a + args.b;
  // });
  // ```
  // The installed handler is available over Serial, Restful, MQTT, Websocket,
  // for example over Websocket:
  // ```bash
  // $ mos --port ws://192.168.0.206/rpc call Sum '{"a":1, "b": 2}'
  // 3
  // ```
  // Or, over familiar RESTful call:
  // ```bash
  // $ curl -d '{"a":1, "b": 2}' 192.168.0.206/rpc/Sum
  // 3
  // ```
  addHandler: function(name, cb, ud) {
    let data = {cb: cb, ud: ud};
    this._addHandler(this._strdup(name), this._ahcb, data);
  },

  // ## **`RPC.call(dst, method, args, callback)`**
  // Call remote or local RPC service.
  // Return value: true in case of success, false otherwise.
  //
  // If `dst` is empty, connected server is implied. `method` is a string
  // like "MyMethod", `callback` is a callback function which takes the following
  // arguments: res (results object), err_code (0 means success, or error code
  // otherwise), err_msg (error messasge for non-0 error code), userdata. Example:
  //
  // ```javascript
  // RPC.call(RPC.LOCAL, 'Config.Save', {reboot: true}, function (resp, ud) {
  //   print('Response:', JSON.stringify(resp));
  // }, null);
  // ```
  call: function(dst, name, args, cb, ud) {
    let data = {cb: cb, ud: ud};
    return this._call(dst, name, JSON.stringify(args), this._ccb, data);
  },
};


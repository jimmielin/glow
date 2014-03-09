/**
 * Glowstone
 * A modern, web-based and oriented, extensible Operating System
 *
 * Developed by Jimmie Lin <jimmie.lin@gmail.com> (c) 2013-2014
 * Licensed under the MIT License
 *
 * This component is sourced from wob.js by Ori Livneh <https://github.com/atdt>
 * Original MIT Licensed commit <https://github.com/atdt/wob.js/commit/c3dbebe48037c67ffa703b4bf2c5e6848d79c9f7>
 *
 * @author        Jimmie Lin <jimmie.lin@gmail.com>
 * @since         2013.8.10
 *
 * File Description: System/Core/MultiThread.js
 * Handles true Multi-Threading with Javascript with wob.js on System.MT via WebWorkers
 */

(function (w) {
    "use strict";

    function format(str) {
        var args = Array.prototype.slice.call(arguments, 1);
        return str.replace(/%s/g, function () {
            return args.shift().toString() || '%s';
        });
    }

    function wrap(f) {
        function wrapper(f) {
            self.onmessage = function (e) {
                self.postMessage({
                    control  : e.data.control,
                    resp     : f.apply(f, e.data.args)
                });
            };
        }
        return format('(%s)(%s)', wrapper, f);
    }

    var BlobBuilder = (w.BlobBuilder ||
                       w.WebKitBlobBuilder),

        URL = (w.URL ||
               w.webkitURL),

        urlref = {
            assign: function (o) {
                var builder, blob;

                builder = new BlobBuilder();
                builder.append(o);
                blob = builder.getBlob();
                return URL.createObjectURL(blob);
            },
            revoke: URL.revokeObjectURL
        },

        wob = function (f) {
            var worker = wob.Worker(f),
                callbacks = {},
                control = 0;

            return function () {
                var args = Array.prototype.slice.call(arguments, 0);

                callbacks[control] = args.pop();

                worker.onmessage = function(e) {
                    callbacks[e.data.control](e.data.resp);
                };

                worker.postMessage({
                    control : control,
                    args    : args
                });

                control++;
            };
        };

        wob.Worker = function (o) {
            var src = typeof o === 'function' ? wrap(o) : o.toString(),
                ref = urlref.assign(src),
                worker = new w.Worker(ref);
            urlref.revoke(ref);
            worker.on = worker.addEventListener;
            return worker;
        };

    w.System.MT = wob;
}(this));
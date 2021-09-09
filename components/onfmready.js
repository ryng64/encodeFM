!(function (e) {
  "function" == typeof define && define.amd ? define(e) : e();
})(function () {
  "use strict";
  (() => {
    let e,
      t = [];
    const n = window,
      o = () => {
        if (!e) {
          const e = new Event("filemaker-ready");
          n.dispatchEvent(e), document.dispatchEvent(e);
        }
        const t = Object.assign(new Event("filemaker-expected"), {
          filemaker: !e,
          FileMaker: !e,
        });
        n.dispatchEvent(t), document.dispatchEvent(t);
      };
    if ("object" == typeof n.FileMaker) return void setTimeout(o);
    n.OnFMReady = Object.assign(
      { respondTo: {}, noLogging: !1, unmount: !1 },
      n.OnFMReady
    );
    const i = {
        PerformScript: (e, t) => i.PerformScriptWithOption(e, t),
        PerformScriptWithOption: (n, o, i = 0) => {
          e ? r(n, o, i) : t.push([n, o, i]);
        },
      },
      r = (e, t, o) => {
        const i = n.OnFMReady.respondTo[e];
        return i
          ? i(t, o)
          : n.OnFMReady.noLogging
          ? null
          : console.log(
              Object.assign({ script: e, param: t }, o ? { option: o } : {})
            );
      };
    let c,
      d,
      s = i;
    document.addEventListener("DOMContentLoaded", () => {
      (s = null),
        (d = !0),
        setTimeout(() => {
          setTimeout(() => {});
        });
    }),
      Object.defineProperty(window, "FileMaker", {
        set(e) {
          (s = e),
            (d = !1),
            clearTimeout(c),
            void 0 !== e &&
              setTimeout(() => {
                t.forEach((e) => {
                  s.PerformScriptWithOption(...e);
                }),
                  (t = []),
                  o();
              });
        },
        get: () => (
          d &&
            (c = setTimeout(() => {
              (e = !0), (n.FileMaker = n.OnFMReady.unmount ? void 0 : i);
            })),
          s
        ),
      });
  })();
});

#define ram mem._ram
#define rom mem._rom

pseudo.CstrMain = (function() {
  // Generic function for file read
  function file(path, fn) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      fn(xhr.response);
    };
    xhr.responseSort = dataBin;
    xhr.open('GET', path);
    xhr.send();
  }

  // Exposed class functions/variables
  return {
    awake() {
      $(function() { // DOMContentLoaded
        vs     .awake($('#screen'));
        rootcnt.awake();
        r3ka   .awake($('#output'));

        file('bios/scph1001.bin', function(resp) {
          // Move BIOS to Mem
          rom.ub.set(new UintBcap(resp));
        });
      });
    },

    reset(path) {
      // Reset all emulator components
      vs     .reset();
      mem    .reset();
      rootcnt.reset();
      bus    .reset();
      r3ka   .reset();

      if (path === 'bios') { // BIOS run
        r3ka.run();
      }
      else { // Homebrew run
        file(path, function(resp) {
          const header = new UintWcap(resp, 0, 0x800);
          const exe    = new UintBcap(resp, 0x800);
          const offset = header[2+4];
          const size   = header[2+5];

          // Prepare mem
          for (let i=0; i<size; i++) {
            directMemB(ram.ub, offset+i) = exe[i];
          }

          // Prepare processor
          r3ka.exeHeader(header);
          r3ka.run();
        });
      }
    },

    error(out) {
      throw new Error('PSeudo / '+out);
    }
  };
})();

#undef ram
#undef rom

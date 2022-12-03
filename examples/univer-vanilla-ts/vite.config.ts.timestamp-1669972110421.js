// vite.config.ts
import { defineConfig } from "vite";
import path from "path";
import preact from "@preact/preset-vite";

// package.json
var name = "univer-vanilla-ts";
var version = "0.0.1";

// vite.config.ts
import createExternal from "vite-plugin-external";
var resolve = (url) => path.resolve("D:\\code\\gogs\\univer\\examples\\univer-vanilla-ts", url);
var vite_config_default = defineConfig({
  build: {
    lib: {
      entry: resolve("src/index.ts"),
      name: "UniverVanillaTs",
      formats: ["es", "cjs", "umd", "iife"],
      fileName: "univer-vanilla-ts"
    },
    outDir: "./lib"
  },
  define: {
    pkgJson: { name, version }
  },
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
      generateScopedName: "univer-[local]"
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  server: {
    port: 3103,
    open: true
  },
  plugins: [
    preact(),
    createExternal({
      externals: {}
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgcHJlYWN0IGZyb20gJ0BwcmVhY3QvcHJlc2V0LXZpdGUnO1xuaW1wb3J0IHsgbmFtZSwgdmVyc2lvbiB9IGZyb20gJy4vcGFja2FnZS5qc29uJztcbmltcG9ydCBjcmVhdGVFeHRlcm5hbCBmcm9tICd2aXRlLXBsdWdpbi1leHRlcm5hbCc7XG5cbmNvbnN0IHJlc29sdmUgPSAodXJsOiBzdHJpbmcpID0+IHBhdGgucmVzb2x2ZShcIkQ6XFxcXGNvZGVcXFxcZ29nc1xcXFx1bml2ZXJcXFxcZXhhbXBsZXNcXFxcdW5pdmVyLXZhbmlsbGEtdHNcIiwgdXJsKTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgICBidWlsZDoge1xuICAgICAgICBsaWI6IHtcbiAgICAgICAgICAgIGVudHJ5OiByZXNvbHZlKCdzcmMvaW5kZXgudHMnKSxcbiAgICAgICAgICAgIG5hbWU6ICdVbml2ZXJWYW5pbGxhVHMnLFxuICAgICAgICAgICAgZm9ybWF0czogWydlcycsICdjanMnLCAndW1kJywgJ2lpZmUnXSxcbiAgICAgICAgICAgIGZpbGVOYW1lOiAndW5pdmVyLXZhbmlsbGEtdHMnLFxuICAgICAgICB9LFxuICAgICAgICBvdXREaXI6ICcuL2xpYicsXG4gICAgfSxcbiAgICBkZWZpbmU6IHtcbiAgICAgICAgcGtnSnNvbjogeyBuYW1lLCB2ZXJzaW9uIH0sXG4gICAgfSxcbiAgICBjc3M6IHtcbiAgICAgICAgbW9kdWxlczoge1xuICAgICAgICAgICAgbG9jYWxzQ29udmVudGlvbjogJ2NhbWVsQ2FzZU9ubHknLCAvLyBkYXNoIHRvIGNhbWVsQ2FzZSBjb252ZXJzaW9uLy8gLmFwcGx5LWNvbG9yIC0+IGFwcGx5Q29sb3JcbiAgICAgICAgICAgIGdlbmVyYXRlU2NvcGVkTmFtZTogJ3VuaXZlci1bbG9jYWxdJywgLy8gY3VzdG9tIHByZWZpeCBjbGFzcyBuYW1lXG4gICAgICAgIH0sXG4gICAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgICAgICAgIGxlc3M6IHtcbiAgICAgICAgICAgICAgICBqYXZhc2NyaXB0RW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgICAgcG9ydDogMzEwMyxcbiAgICAgICAgb3BlbjogdHJ1ZSwgLy8gQXV0b21hdGljYWxseSBvcGVuIHRoZSBhcHAgaW4gdGhlIGJyb3dzZXIgb24gc2VydmVyIHN0YXJ0LlxuICAgIH0sXG4gICAgcGx1Z2luczogW1xuICAgICAgICBwcmVhY3QoKSxcbiAgICAgICAgLy8gbGVnYWN5KHtcbiAgICAgICAgLy8gICAgIHRhcmdldHM6IFsnaWUgPj0gMTEnXSxcbiAgICAgICAgLy8gICAgIGFkZGl0aW9uYWxMZWdhY3lQb2x5ZmlsbHM6IFsncmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lJ10sXG4gICAgICAgIC8vIH0pLFxuICAgICAgICBjcmVhdGVFeHRlcm5hbCh7XG4gICAgICAgICAgICBleHRlcm5hbHM6IHtcbiAgICAgICAgICAgICAgICAvLyAnQHVuaXZlci9jb3JlJzogJ0B1bml2ZXIvY29yZScsXG4gICAgICAgICAgICAgICAgLy8gJ0B1bml2ZXIvc3R5bGUtdW5pdmVyc2hlZXQnOiAnQHVuaXZlci9zdHlsZS11bml2ZXJzaGVldCcsXG4gICAgICAgICAgICAgICAgLy8gcHJlYWN0OiAncHJlYWN0JyxcbiAgICAgICAgICAgICAgICAvLyByZWFjdDogJ3JlYWN0JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pLFxuICAgIF0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFVBQVU7QUFDakIsT0FBTyxZQUFZOzs7Ozs7O0FBRW5CLE9BQU8sb0JBQW9CO0FBRTNCLElBQU0sVUFBVSxDQUFDLFFBQWdCLEtBQUssUUFBUSx1REFBdUQsR0FBRztBQUV4RyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixPQUFPO0FBQUEsSUFDSCxLQUFLO0FBQUEsTUFDRCxPQUFPLFFBQVEsY0FBYztBQUFBLE1BQzdCLE1BQU07QUFBQSxNQUNOLFNBQVMsQ0FBQyxNQUFNLE9BQU8sT0FBTyxNQUFNO0FBQUEsTUFDcEMsVUFBVTtBQUFBLElBQ2Q7QUFBQSxJQUNBLFFBQVE7QUFBQSxFQUNaO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDSixTQUFTLEVBQUUsTUFBTSxRQUFRO0FBQUEsRUFDN0I7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNELFNBQVM7QUFBQSxNQUNMLGtCQUFrQjtBQUFBLE1BQ2xCLG9CQUFvQjtBQUFBLElBQ3hCO0FBQUEsSUFDQSxxQkFBcUI7QUFBQSxNQUNqQixNQUFNO0FBQUEsUUFDRixtQkFBbUI7QUFBQSxNQUN2QjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDSixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDVjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ0wsT0FBTztBQUFBLElBS1AsZUFBZTtBQUFBLE1BQ1gsV0FBVyxDQUtYO0FBQUEsSUFDSixDQUFDO0FBQUEsRUFDTDtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==

# Lunamoon
This is my personal website. Built via Angular with the assistant of Builder.io.

*Well, seems like this website will initiate some interesting ideas.*

Auth: `月と猫 - LunaNeko`

## How to access to the game?
Here is the Prime Breathing game: `https://lunaticlegacy.github.io/#/prime-breathing`
- Q: Why I Can't Refresh?
  - **DO NOT** refresh the website by your browser once you loaded because GitHub will automatically delete that `#` between two `/`s.

## Structure of this Project

- Based on Angular.
- Structure based on this:

```
/ (root)

|- public
    |- pictures
        |- (All pictures here.)
    |- favicon.ico (The icon.) 
|- src (Codes inside.)
    |- index (including: index.html, main.ts, styles.css)
    |- app (for all the components)
        |- app.* (* for css, html, ts, routes.ts, spec.ts, config.ts)
        |- games
            |- prime-breathing
                |- prime-breathing.* (* for css, html, ts)
        |- home
            |- home.* (* for css, html, ts)
```
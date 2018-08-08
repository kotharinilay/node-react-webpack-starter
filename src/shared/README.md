This repo consist common utility which can be rendered at server/client both (universal).
 
- Moment-Timezone
- Numeral
- Validator
- Guid/UUID


- Convert rgb to hex color code

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
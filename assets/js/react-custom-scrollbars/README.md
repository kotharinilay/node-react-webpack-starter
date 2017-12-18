Scroll bar reference link : https://github.com/malte-wessel/react-custom-scrollbars

- To use this package install below modules

1. npm i -S raf
2. npm i -S dom-css
3. import { Scrollbars } from '../../../../../../assets/js/react-custom-scrollbars';


- To configure auto hide based on document set
autoHeightMax: (typeof document === 'undefined') ? 200 : (document.body.clientHeight - 200)
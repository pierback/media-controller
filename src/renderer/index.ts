'use strict';
import { ipcRenderer as ipc } from 'electron';
//import { utility } from '../scripts/utility/js/utility';

let elements: any = document.getElementsByClassName('radiobtn');

ipc.send('storeget');
ipc.on('asynchronous-reply', function (_event: Event, data: string) {
    ipc.send('load', 'reply ' + data);
    for (let i = 0, max = elements.length; i < max; i++) {
        if (elements[i].value === data) {
            elements[i].checked = true;
        }
    }
});

for (let i = 0, max = elements.length; i < max; i++) {
    elements[i].onchange = function () {
        ipc.send('storeSet', { data: this.value, mb: this.value });
    };
}
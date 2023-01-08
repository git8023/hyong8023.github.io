/**
 * 条目
 *
 * @example
 * 布局：
 *    block - 标题
 *    flex-row
 *        flex-1: source code
 *        flex-1(flex-col):
 *            flex-1: render result
 *            flex-1: console
 */
class CEntry extends HTMLElement {
    root;
    codeMirror;
    static index = 0;
    results;
    get index() {
        return ++CEntry.index;
    }
    static get observedAttributes() {
        return ['console-results', 'src-code'];
    }
    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        this.root.appendChild(this.css());
        this.root.appendChild(this.html());
        // 获取视图
        this.results = this.root.getElementById('results');
    }
    css() {
        const styleTag = document.createElement('style');
        styleTag.innerHTML = `
      @import url('css/style.css');
      @import url('lib/codemirror/codemirror.css');

      :host {display:block;}
      // :host * {transition:all .3s;}
      .border {border:1px solid #eee;}
      .display-none {display:none;}
      textarea.code {height:300px;}

      // .box-bound {transition:all .3s;}
      .collage {height:0!important; overflow:hidden;}
      ul {width:100%; overflow:auto;}
      li {border-bottom:1px dashed #f8f8f8; padding:.25rem; white-space:nowrap;}
      li:hover {background:#f8f8f8;}
      .render-box {max-height:30%;}
      .width__zero {width:0;}
    `;
        return styleTag;
    }
    html() {
        const tpl = document.createElement('template');
        tpl.innerHTML = `
     <div class="root">
        <h2 id="title" class="dc-gap-bottom pointer"> ${this.index}. ${this.getAttribute('note')} </h2>
        <div class="dc-flex-row box-bound" id="boxBound">
          <div class="dc-flex-1 border width__zero">
            <slot name="src-code">Source Code</slot>
            <textarea id="srcCode" class="dc-full code"></textarea>
          </div>
          <div class="dc-flex-1 dc-flex-col dc-gap-left width__zero">
            <div class="border dc-box-padding reder-box">
              <slot name="render">Render Result</slot>
            </div>
            <ul class="dc-flex-1 border dc-overflow-auto" id="results" />
          </div>
        </div>
      </div>`;
        return tpl.content.cloneNode(true);
    }
    // 组件被挂载
    connectedCallback() {
        console.log('Custom square element added to page.');
        const slot = this.root.querySelector('slot[name="src-code"]');
        slot.classList.add('display-none');
        const tae = this.root.getElementById('srcCode');
        // @ts-ignore
        const ae = slot.assignedElements()[0];
        if (ae) {
            tae.value = String(ae.textContent);
        }
        this.codeMirror = CodeMirror.fromTextArea(tae, {
            lineNumbers: true,
            mode: 'javascript',
        });
        const boxBound = this.root.getElementById('boxBound');
        const rect = boxBound.getBoundingClientRect();
        boxBound.style.height = `${rect.height}px`;
        // 添加事件
        this.root.getElementById('title')
            .addEventListener('click', () => boxBound.classList.toggle('collage'));
    }
    // 组件卸载
    disconnectedCallback() {
        console.log('Custom square element removed from page.');
    }
    // 组件移动到新文档
    adoptedCallback() {
        console.log('Custom square element moved to new page.');
    }
    // 属性变化
    attributeChangedCallback(name, oldValue, newValue) {
        console.log('Custom square element attributes changed.', name, oldValue, newValue);
        switch (name) {
            case 'console-results':
                if (newValue.trim().length) {
                    this.appendResult(newValue);
                }
                break;
            case 'src-code':
                this.fetchCodeSource();
                break;
            default:
                console.warn('无效属性', name, oldValue, newValue);
        }
    }
    appendResult(result) {
        const li = document.createElement('li');
        li.innerText = result;
        this.results.prepend(li);
    }
    fetchCodeSource() {
        const srcArrStr = this.getAttribute('src-code').replaceAll('\'', '"').trim();
        if (srcArrStr) {
            const srcArr = JSON.parse(srcArrStr);
            fetch(srcArr[0])
                .then((data) => data.text())
                .then((code) => this.codeMirror.setValue(code));
        }
    }
}
window.customElements.define('c-entry', CEntry);

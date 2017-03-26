let slice = Array.prototype.slice;
let _div = document.createElement('div');
export function $(slt: string, ele?: HTMLElement): HTMLElement {
  if (slt instanceof HTMLElement) {
    return slt;
  }
  return (ele || document).querySelector(slt)
}
export function $e(html: string|HTMLElement): HTMLElement {
  if (html instanceof HTMLElement) {
    return html.cloneNode(true);
  }
  _div.innerHTML = html;
  let child = _div.children[0];
  _div.innerHTML = '';
  removeNodeFromParent(child);
  return child;
}
export function $$e(html: string): HTMLElement[] {
  _div.innerHTML = html;
  let children = slice.call(_div.children);
  children.forEach(removeNodeFromParent);
  _div.innerHTML = '';
  return children;
}
export function _$(slt: string, ele?: HTMLElement): HTMLElement {
  return (ele || document).shadowRoot.querySelector(slt)
}
export function _$$(slt: string, ele?: HTMLElement): Array<HTMLElement> {
  return slice.call((ele || document).shadowRoot.querySelectorAll(slt))
}
export function $$(slt: string, ele?: HTMLElement): Array<HTMLElement> {
  return slice.call((ele || document).querySelectorAll(slt))
}
export function toggleClass(ele: HTMLElement, className: string, showClass?: boolean) {
  let hasClass = arguments.length == 2 ? ele.classList.contains(className) : !showClass;
  ele.classList[hasClass ? 'remove' : 'add'](className);
}
export function removeNodeFromParent(node: HTMLElement): Boolean {
  if (node && node.parentNode) {
    node.parentNode.removeChild(node);
    return true;
  }
  return false;
}
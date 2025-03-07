import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'ellipsis', standalone: true })
export class EllipsisPipe implements PipeTransform {
  transform(str: string, strLength = 35) {
    if (str) {
      const withoutHtml = str.replace(/(<([^>]+)>)/gi, '');

      if (str.length >= strLength) {
        return `${withoutHtml.slice(0, strLength)}...`;
      }

      return withoutHtml;
    }
    return null;
  }
}

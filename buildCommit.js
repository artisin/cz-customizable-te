'use strict';


var wrap = require('word-wrap');

module.exports = function buildCommit(answers, config) {

  var maxLineWidth = 70;

  var wrapOptions = {
    trim: true,
    newline: '\n',
    indent:'',
    width: maxLineWidth
  };

  function addScope(scope) {
    if (!scope) return ': '; //it could be type === WIP. So there is no scope

    return '(' + scope.trim() + '): ';
  }

  function addSubject(subject) {
    return subject.trim();
  }

  function escapeSpecialChars(result) {
    var specialChars = ['\`'];

    specialChars.map(function (item) {
      // For some strange reason, we have to pass additional '\' slash to commitizen. Total slashes are 4.
      // If user types "feat: `string`", the commit preview should show "feat: `\\string\\`".
      // Don't worry. The git log will be "feat: `string`"
      result = result.replace(new RegExp(item, 'g'), '\\\\`');
    });
    return result;
  }

  // Hard limit this line
  var head = (answers.type + addScope(answers.scope) + addSubject(answers.subject)).slice(0, maxLineWidth);
  if (answers.footer && answers.footer.length && answers.footer.length < 10) {
    head += answers.footer && answers.footer.includes('#') ? ` → ${answers.footer}` : ` → #${answers.footer}`;
  }

  // Wrap these lines at 100 characters
  var body = wrap(answers.body, wrapOptions) || '';
  body = body.split('|').join('\n');

  var breaking = wrap(answers.breaking, wrapOptions);
  var footer = wrap(answers.footer, wrapOptions);

  var result = head;
  if (body) {
    result += '\n\n' + body;
  }
  if (breaking) {
    result += '\n\n' + 'BREAKING CHANGE:\n' + breaking;
  }

  //builds close isses -> CLOSES XX, CLOSES XX,
  if (footer && typeof footer === 'string' && !answers.pivotalTag) {
    var footerPrefix = config && config.footerPrefix ? config.footerPrefix : 'CLOSES';
    if (footer.includes(',')) {
      result += '\n\n';
      footer.split(',').forEach(function (val) {
        result += footerPrefix + ' ' + val.replace(/\s/g, '') + ', ';
      })
      //remove last comma, and replace two spaces with single
      result = result.replace(/,\s$/, '');
    }else {
      result += '\n\n' + footerPrefix + ' ' + footer;
    }
  }else if (answers.pivotalTag && answers.pivotalId) {
    var pivotalTag = answers.pivotalTag;
    var pivotalId = answers.pivotalId;
    if (pivotalId.includes(',')) {
      result += '\n\n';
      pivotalId.split(',').forEach(function (val) {
        var tag = val.replace(/\s/g, '');
        tag = tag.includes('#') ? tag : '#' + tag;
        result += '[' + pivotalTag + ' ' + tag + '], ';
      })
      //remove last comma, and replace two spaces with single
      result = result.replace(/,\s$/, '');
    }else {
      pivotalId = pivotalId.includes('#') ? pivotalId : '#' + pivotalId;
      result += '\n\n' + '[' + pivotalTag + ' ' + pivotalId + ']';
    }
  }

  return escapeSpecialChars(result);
};

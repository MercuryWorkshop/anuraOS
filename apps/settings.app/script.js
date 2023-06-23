/// <reference path="../../src/api/Settings.ts"/>
/// <reference path="../../src/Anura.ts"/>
function openSetting(evt, TabName) {
  let x86button = document.getElementById('x86subsystemsstate')

  if (!anura.settings.get("disable-x86")) {
    x86button.innerText = 'Use x86 subsystem (enabled)'
  } else {
    x86button.innerText = 'Use x86 subsystem (disabled)'
  }

  x86button.onclick = function() {
    if (anura.settings.get("disable-x86")) {
      anura.settings.set("disable-x86", false)
      x86button.innerText = 'Use x86 subsystem (disabled)'

    } else {
      anura.settings.set("disable-x86", true)
      x86button.innerText = 'Use x86 subsystem (enabled)'
    }
  }

  let aboutbrowserbutton = document.getElementById('abtbrowser')
  if (!anura.settings.get("borderless-aboutbrowser")) {
    aboutbrowserbutton.innerText = 'borderless about browser (disabled)'
  } else {
    aboutbrowserbutton.innerText = 'borderless about browser (enabled)'
  }

  aboutbrowserbutton.onclick = function() {
    if (!anura.settings.get("borderless-aboutbrowser")) {
      anura.settings.set("borderless-aboutbrowser", true)
      aboutbrowserbutton.innerText = 'borderless about browser (enabled)'

    } else {
      anura.settings.set("borderless-aboutbrowser", false)
      aboutbrowserbutton.innerText = 'borderless about browser (disabled)'
    }
  }

  document.getElementById('default').click()

  var i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(TabName).style.display = "flex";
  evt.currentTarget.className += " active";



}

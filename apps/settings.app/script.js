/// <reference path="../../src/api/Settings.ts"/>
/// <reference path="../../src/Anura.ts"/>
function openSetting(evt, TabName) {
  let x86button = document.getElementById('x86subsystemsstate')

  if (!anura.settings.get("disable-x86")) {
    x86button.innerText = 'x86 Subsystem - ON'
  } else {
    x86button.innerText = 'x86 Subsystem - OFF'
  }

  x86button.onclick = function() {
    if (anura.settings.get("disable-x86")) {
      anura.settings.set("disable-x86", false)
      x86button.innerText = 'x86 Subsystem - OFF'

    } else {
      anura.settings.set("disable-x86", true)
      x86button.innerText = 'x86 Subsystem - ON'
    }
  }

  let aboutbrowserbutton = document.getElementById('abtbrowser')
  if (!anura.settings.get("borderless-aboutbrowser")) {
    aboutbrowserbutton.innerText = 'Borderless Browser - OFF'
  } else {
    aboutbrowserbutton.innerText = 'Borderless Browser - ON'
  }

  aboutbrowserbutton.onclick = function() {
    if (!anura.settings.get("borderless-aboutbrowser")) {
      anura.settings.set("borderless-aboutbrowser", true)
      aboutbrowserbutton.innerText = 'Borderless Browser - ON'

    } else {
      anura.settings.set("borderless-aboutbrowser", false)
      aboutbrowserbutton.innerText = 'Borderless Browser - OFF'
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
# anura is not defined accoring to Dev Tools
# https://media.discordapp.net/attachments/1096925028886515792/1127955000123981916/image.png?width=487&height=83

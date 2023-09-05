# Overriding initrd and kernel(Extended)

In the event that you should need to override/manually add the initrd and kernel, remember to keep track of the file names of initrd and vmlinuz in build/images/debian-boot/.

The names will most likely be in the folowing format: initrd.img-6.1.0-11-686 and vmlinuz-6.1.0-11-686

You will next need to download them and rename each respectivly to initrd.img and vmlinuz.

After that you can go ahead and upload them to Anura's root file directory(see Screenshots with instructions below):

Select the file browser app in Anura(circled in red)
![SCRS1](./assets/Screenshot%202023-08-29%2010.04.23%20AM.png)

Next, Right click in the files app and select the "Upload from PC" option(circled in red)
![SCRS2](./assets/Screenshot%202023-08-29%2010.38.39%20AM.png)

Finally, select the files you previously downloaded (initrd.img and vmlinuz) and upload them.

Congrats! You have successfully overridden initrd and the kernel.

/**
 * Micro:Bit makeCode extension for neopixel/ws2812b matrices
 * merged functions from smartMatrix https://github.com/Shorts1999/pxt-smartmatrix
 * and Expressive Pixels https://github.com/microsoft/ExpressivePixelsMakeCode
 */


enum drawDirection {
    //% block="Normal"
    normal = 1,
    //% block="Mirrored"
    mirrored = 0
}

//% weight=6 color=#00CC60 icon="\uf110"
namespace SmartMatrix {

    /**
     * A Matrix made of ws2812b LEDs
     */
    export class Matrix {
        strip: neopixel.Strip
        Width: number
        Height: number
        /**
         * Push all changes made to the framebuffer to the display
         */
        //% blockId="Matrix_show" block="%matrix| show"
        //% weight=90
        //% blockGap=8 parts="SmartMatrix"
        show(): void {
            this.strip.show();
        }
        /**
         * Set the brightness of the LEDs
         * @param setpoint -the brightness setpoint, on a scale from 0-255
         */
        //% blockId="Matrix_Brightness" block="%matrix set brightness to %setpoint"
        //% weight=80
        //% setpoint.defl=32
        //% blockGap=8 parts="SmartMatrix"
        Brightness(setpoint: number): void {
            this.strip.setBrightness(setpoint);
        }
        /**
         * Empty the entire framebuffer, a call to "show()" must be made to made changes visible
         */
        //% blockId="Matrix_clear" block="clear %matrix"
        //% weight=80
        //% blockGap=8 parts="SmartMatrix"
        clear(): void {
            this.strip.clear();
        }
        /**
         * Set a single pixel on the display to a specific colour
         * @param x - the position on the x-axis (left is 0)
         * @param y - the position on the y-axis (top is 0)
         * @param colour - the colour to set the pixel to
         */
        //% blockId="Matrix_setPixel" block="%matrix| set pixel at x %x| y %y| to colour %colour"
        //% weight=80
        //% colour.shadow=neopixel_colors
        //% blockGap=8 parts="SmartMatrix"
        setPixel(x: number, y: number, colour: number): void {
            if (x < 0 || x > this.Width || y < 0 || y > this.Height) { return } //If the pixel does not fit on screen, do not draw it
            if (y % 2) { this.strip.setPixelColor(x + (y * this.Height), colour); } //Because of the zig-zag formation of the panel all even rows (including 0) are drawn top to bottom
            else { this.strip.setPixelColor((this.Width - x - 1) + (y * this.Height), colour); } //While all odd rows are drawn bottom to top
        }

        /**
         * scroll a string of text on the matrix
         * @param text the text to scroll 
         * @param speed how fast the text should scroll
         * @param yoffset the y position for the text
         * @param colour the colour in which the text will be displayed
         */
        //% blockId="Matrix_scrollText" block="%matrix scroll text %text| with speed %speed| on Y postition %yoffset| and colour %colour"
        //% weight=75
        //% colour.shadow=neopixel_colors
        //% speed.min=1 speed.max=2000 speed.defl=1200
        //% blockGap=8 parts="SmartMatrix"
        scrollText(text: string, speed: number, yoffset: number, colour: number): void {
            this.strip.clear();
            for (let Xpos = this.Width; Xpos > -6 * text.length; Xpos--) {//for loop to scroll across the entire matrix
                for (let letter = 0; letter < text.length; letter++) {//for loop to retrieve all the letters from te text
                    let bitmap = getLettermap(text.charAt(letter))
                    this.drawBitmap(bitmap, Xpos + (6 * letter), yoffset, 7, 8, colour, drawDirection.normal)
                }
                this.strip.show();
                basic.pause(speed);
                this.strip.clear();
            }
        }

        /**
         * draw a monochrome bitmap on the matrix
         * a '1' will be set to the selected colour, a '0' will be ignored, allowing the bitmaps to be layered
         * @param bitmap -the bitmap array to display
         * @param x -the postition on the x-axis (left is 0)
         * @param y -the position on the y-axis (top is 0)
         * @param width -the width of the bitmap
         * @param height -the height of the bitmap
         * @param colour -the colour to display the bitmap in
         * @param direction -set this to 0 to mirror the image
         */
        //% blockId="Matrix_drawBitmap" block="%matrix draw bitmap %bitmap at x %x y %y | with width %width height %height in colour %colour | draw direction %direction"
        //% weight=100
        //% x.defl=0 y.defl=0 width.defl=8 height.defl=8
        //% colour.shadow=neopixel_colors
        //% advanced=true
        //% direction.shadow="drawDirection"
        drawBitmap(bitmap: number[], x: number, y: number, width: number, height: number, colour: number, direction: drawDirection): void {
            let byteInLine = Math.floor((width + 7) / 8) //The amount of bytes per horizontal line in the bitmap
            for (let Ypos = 0; Ypos < height; Ypos++) {
                for (let hzScan = 0; hzScan < byteInLine; hzScan++) {
                    for (let bitmask = 0; bitmask < 8; bitmask++) {
                        if (bitmap[(Ypos * byteInLine) + hzScan] & 0x01 << bitmask) {
                            if (direction) {
                                this.setPixel(x + (8 * hzScan) - bitmask + 7, y + Ypos, colour)
                            }
                            else {
                                this.setPixel(width - (x + (8 * hzScan) - bitmask + 7) - 1, y + Ypos, colour)
                            }
                        }
                    }
                }
            }
        }

        /**
 * draw a 2D array to the matrix
 * @param arr2d -the 2 dimensional array with numbers or colours
 * @param x -the postition on the x-axis (left is 0)
 * @param y -the position on the y-axis (top is 0)
 */
        //% blockId="Matrix_drawB2D" block="%matrix draw 2D-Array %arr2d at x %xpos y %ypos in colour %colour"
        //% weight=120
        //% xpos.defl=0 ypos.defl=0
        //% colour.shadow=neopixel_colors
        //% advanced=true
        //% direction.shadow="drawDirection"
        draw2DArray(arr2d: number[][], xpos: number, ypos: number): void {
            for (let x = 0; x < arr2d[0].length; x++) {
                for (let y = 0; y < arr2d[1].length; y++) {
                    this.setPixel(y + ypos, x + xpos, arr2d[y][x])
                }
            }
        }

        /**
         * draw an animation by microsoft expressive pixels
         * the pixels were exported as hex stored as a variable and loaded to the buffer
         */
        //% blockId="Matrix_writeAnimation" block="%matrix draw expressivePixels animation"
        //% weight=85
        //% colour.shadow=neopixel_colors
        //% blockGap=8 parts="SmartMatrix"
        writeAnimation(anim: Buffer, speed?: number) {
            const length = anim.length;
            let palette = [];

            // Extract FrameCount
            let FrameCount = (anim[1] << 8) | anim[0];
            let LoopCount = anim[2];
            let FrameRate = anim[3];
            let PaletteLengthBytes = (anim[5] << 8) | anim[4];
            let PaletteLength = PaletteLengthBytes / 3;
            let FramesLength = (anim[9] << 24) | (anim[8] << 16) | (anim[7] << 8) | anim[6];
            let frameDelayMS = speed;
            if (frameDelayMS === null || frameDelayMS === undefined) {
                frameDelayMS = 1000.0 / FrameRate;
            }
            let originalBrightness = this.strip.brightness;
            let activeFadeStep = 0;
            let activeFadeWait = 0;

            let paletteOffset = 10;
            for (let idx = 0; idx < PaletteLength; idx++) {
                const c = neopixel.rgb(anim[paletteOffset + idx * 3], anim[paletteOffset + idx * 3 + 1], anim[paletteOffset + idx * 3 + 2]);
                palette.push(c);
            }

            if (LoopCount == 0)
                LoopCount = 1;
            while (LoopCount-- > 0) {
                let framesOffset = paletteOffset + PaletteLengthBytes;
                let frameByteOffset = 0;
                let paletteIdx = 0;

                for (let frameIdx = 0; frameIdx < FrameCount; frameIdx++) {
                    let framePixelCount = 0;
                    let frameType = anim[framesOffset + frameByteOffset];
                    frameByteOffset++;

                    if (frameType == 73) {
                        // Read the number of pixels represented in this frame type
                        framePixelCount = (anim[framesOffset + frameByteOffset + 0] << 8) | anim[framesOffset + frameByteOffset + 1];
                        frameByteOffset += 2;

                        // Process each represented pixel
                        for (let pixelPos = 0; pixelPos < framePixelCount; pixelPos++) {
                            paletteIdx = anim[framesOffset + frameByteOffset];
                            frameByteOffset++;
                            if (paletteIdx < PaletteLength) {
                                this.strip.setPixelColor(pixelPos, palette[paletteIdx]);
                            }
                        }
                        this.strip.show();
                        basic.pause(frameDelayMS);
                    }
                    else if (frameType == 80) { // 'P'
                        let logicalPixelPosition = 0;

                        // Read the number of pixels represented in this frame type
                        framePixelCount = (anim[framesOffset + frameByteOffset] << 8) | anim[framesOffset + frameByteOffset + 1];
                        frameByteOffset += 2;

                        for (let pixelPos2 = 0; pixelPos2 < framePixelCount; pixelPos2++) {
                            // Process each represented pixel
                            if (this.strip._length > 256) {
                                logicalPixelPosition = (anim[framesOffset + frameByteOffset] << 8) | anim[framesOffset + frameByteOffset + 1];
                                frameByteOffset += 2;
                            }
                            else {
                                logicalPixelPosition = anim[framesOffset + frameByteOffset];
                                frameByteOffset++;
                            }

                            paletteIdx = anim[framesOffset + frameByteOffset];
                            frameByteOffset++;
                            if (paletteIdx < PaletteLength) {
                                this.strip.setPixelColor(logicalPixelPosition, palette[paletteIdx]);
                            }
                        }
                        this.strip.show();
                        basic.pause(frameDelayMS);
                    }
                    else if (frameType == 68) { // 'D'
                        // Read the frame delay
                        let waitMillis = (anim[framesOffset + frameByteOffset] << 8) | anim[framesOffset + frameByteOffset + 1];
                        frameByteOffset += 2;
                        basic.pause(waitMillis);
                    }
                    else if (frameType == 70) {
                        'F'
                        // Read the frame delay
                        let activeFadeMillis = (anim[framesOffset + frameByteOffset] << 8) | anim[framesOffset + frameByteOffset + 1];
                        frameByteOffset += 2;

                        activeFadeStep = 9;
                        activeFadeWait = (activeFadeMillis + 0.1) / 10;

                        while (activeFadeStep > 0) {
                            let stepBrightness = ((originalBrightness + 0.1) / 10) * activeFadeStep;
                            this.strip.setBrightness(stepBrightness);
                            this.strip.show();

                            basic.pause(activeFadeWait);
                            activeFadeStep--;
                        }
                        this.strip.setBrightness(originalBrightness);
                        this.strip.clear();
                        this.strip.show();
                    }
                }
                this.strip.clear();
            }
        }
    }

    /**
     * Create a new matrix object
     * @param pin the pin to which the matrix is connected
     * @param matrixWidth the amount of leds horizontally
     * @param matrixHeight the amount of leds vertically
     * @param mode the format/type of the LED
     * @param mode the option if every second LED row is reversed
     */
    //% blockId="Matrix_Create" block="Matrix at pin %pin | width %matrixWidth |height %matrixHeight |pixeltype %mode |snake Pattern %snakePattern"
    //% weight=100
    //% matrixWidth.defl=32 matrixHeight.defl=8 snakePattern.defl=false
    //% blockSetVariable=matrix
    //% blockGap=8 parts="SmartMatrix"
    export function create(pin: DigitalPin, matrixWidth: number, matrixHeight: number, mode: NeoPixelMode, snakePattern: boolean): Matrix {
        let matrix = new Matrix;
        matrix.strip = neopixel.create(pin, matrixHeight * matrixWidth, mode);
        matrix.Width = matrixWidth;
        matrix.Height = matrixHeight;
        matrix.strip.setMatrixWidth(matrixWidth, snakePattern);

        return matrix;
    }

    /**
     * Take in a string-character and return a bitmap to draw on the display
     */
    export function getLettermap(char: string): number[] {
        let letterMap: number[] = [0, 0, 0, 0, 0, 0, 0, 0]
        let offset = ((char.charCodeAt(0)) - 32); //Convert the ASCII-Character to it's code to generate the offset in the font-array
        if (offset >= 0) {
            for (let i = 0; i < 8; i++) {
                //Every character has 8 arguments in the array, so multiply the offset by 8, and then take ne next 8 arguments as the value for the correct bitmap.
                letterMap[i] = font8x6.getNumber(NumberFormat.UInt8BE, ((offset * 8) + i))
            }
        }
        return letterMap;
    }

}
const font8x6 = hex`
    0000000000000000 1038381010001000 6C6C480000000000 00287C28287C2800
    2038403008701000 64640810204C4C00 2050502054483400 3030200000000000
    1020202020201000 2010101010102000 0028387C38280000 0010107C10100000
    0000000000303020 0000007C00000000 0000000000303000 0004081020400000
    38444C5464443800 1030101010103800 3844041820407C00 3844043804443800
    081828487C080800 7C40407804443800 1820407844443800 7C04081020202000
    3844443844443800 3844443C04083000 0000303000303000 0000303000303020
    0810204020100800 00007C00007C0000 2010080408102000 3844041810001000
    38445C545C403800 384444447C444400 7844447844447800 3844404040443800
    7844444444447800 7C40407840407C00 7C40407840404000 3844405C44443C00
    4444447C44444400 3810101010103800 0404040444443800 4448506050484400
    4040404040407C00 446C544444444400 4464544C44444400 3844444444443800
    7844447840404000 3844444454483400 7844447848444400 3844403804443800
    7C10101010101000 4444444444443800 4444444444281000 4444545454542800
    4444281028444400 4444442810101000 7808102040407800 3820202020203800
    0040201008040000 3808080808083800 1028440000000000 00000000000000FC
    3030100000000000 000038043C443C00 4040784444447800 0000384440443800
    04043C4444443C00 0000384478403800 1820207820202000 00003C44443C0438
    4040704848484800 1000101010101800 0800180808084830 4040485060504800
    1010101010101800 0000685454444400 0000704848484800 0000384444443800
    0000784444447840 00003C4444443C04 0000582420207000 0000384038043800
    0020782020281000 0000484848582800 0000444444281000 00004444547C2800
    0000484830484800 0000484848381060 0000780830407800 1820206020201800
    1010100010101000 3008080C08083000 2850000000000000`;



namespace arrays {

    //% blockId="rotate2DArraycounterclockwise" block="rotate 2D-Array %a counterclockwise"
    //% weight=300
    //% blockGap=8 parts="List"
    //% advanced=true
    export function rotateCounterClockwise(a: number[][]) {
        let n = a.length;
        for (let i = 0; i < n / 2; i++) {
            for (let j = i; j < n - i - 1; j++) {
                let tmp = a[i][j];
                a[i][j] = a[j][n - i - 1];
                a[j][n - i - 1] = a[n - i - 1][n - j - 1];
                a[n - i - 1][n - j - 1] = a[n - j - 1][i];
                a[n - j - 1][i] = tmp;
            }
        }
        return a;
    }

    //% blockId="rotate2DArrayclockwise" block="rotate 2D-Array %a clockwise"
    //% weight=330
    //% blockGap=8 parts="List"
    //% advanced=true
    export function rotateClockwise(a: number[][]) {
        let n = a.length;
        for (let i = 0; i < n / 2; i++) {
            for (let j = i; j < n - i - 1; j++) {
                let tmp = a[i][j];
                a[i][j] = a[n - j - 1][i];
                a[n - j - 1][i] = a[n - i - 1][n - j - 1];
                a[n - i - 1][n - j - 1] = a[j][n - i - 1];
                a[j][n - i - 1] = tmp;
            }
        }
        return a;
    }

}
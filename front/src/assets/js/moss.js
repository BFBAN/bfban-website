import JSZip from "jszip";

export default class Moss {
    errorContent = {
        '0': 'Verify that the Moss file is successful',
        '100': 'The excursion is not supported, please submit the file by other means',
        '101': 'This is not a valid zip archive, please choose MOSS to generate the zip archive.'
    };

    isSupport() {
        const that = this;
        if (!JSZip.support.blob) {
            return {
                code: -1,
                message: that.errorContent['100']
            }
        }
        return {
            code: 0
        }
    }

    async multiFileProcessing(event) {
        const files = event.target.files;
        const that = this;

        return new Promise(async (resolve) => {
            let promises = [];

            for (let i = 0; i < files.length; i++) {
                promises.push(await that.verifyFileIsMoss(files[i]));
            }

            Promise.wait(promises).then(res => {
                resolve(res);
            });
        })
    }

    async verifyFileIsMoss(file) {
        const that = this;
        return new Promise((resolve) => {
            JSZip.loadAsync(file)
                .then(function (zip) {
                    let _zip = zip;

                    if (!_zip.files['Logfile.log']) {
                        resolve({code: -1, message: that.errorContent['101']})
                    }

                    resolve({code: 0, message: that.errorContent['0']})
                }, function (err) {
                    resolve({code: -1, message: err.toString()})
                });
        })
    }
}

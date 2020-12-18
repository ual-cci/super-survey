<template>
<span>
  <slot :open="openFileDialog"
        :progress="uploadProgress"
        :message="recording"
        :cancel="cancelUpload">
  </slot>
  <input type="file" ref="fileinput" style="display: none"/>
</span>
</template>

<script>
import AudioRecorder from '@/lib/recorder';

export default {
  props: {
    type: String,
    path: String,
    record: Boolean,
  },
  data() {
    return {
      uploadingMedia: false,
      uploadProgress: 0,
      currentMediaType: null,
      OPENED_DIALOG: 0.1,
      RECEIVED_FILE: 0.2,
      recorder: null,
      recording: false,
    };
  },
  uploadTask: null,
  computed: {
    recordFromMic() {
      return this.type === 'audio' && this.record;
    },
  },
  methods: {
    openFileDialog() {
      if (this.recordFromMic) {
        if (this.recording) {
          this.recorder.stop();
          this.recording = null;
        } else {
          this.recorder.start();
          this.recording = 'Recording... press again to stop';
        }
      } else if (!this.uploadingMedia) {
        this.uploadProgress = this.OPENED_DIALOG;
        // simulate open file dialog
        const { fileinput } = this.$refs;
        if (this.type === 'image-upload') {
          fileinput.accept = 'image/*, .pdf';
          fileinput.multiple = true;
        } else if (this.type === 'photo') {
          fileinput.accept = 'image/*';
        } else {
          fileinput.accept = `${this.type}/*`;
        }

        fileinput.click();

        // watch for cancel button on dialog
        document.body.onfocus = () => {
          if (this.uploadProgress === this.OPENED_DIALOG) {
            // cancel pressed
            this.uploadProgress = 0;
          }
          document.body.onfocus = null;
        };
      }
    },
    async uploadMediaHandler(event) {
      const { files } = event.target;
      if (files.length < 1) {
        return;
      }
      this.uploadProgress = this.RECEIVED_FILE;

      for (let i = 0; i < files.length; i++) {
        /* eslint-disable-next-line no-await-in-loop */
        await this.uploadIndex(files, i);
      }
    },
    uploadIndex(files, index) {
      return new Promise((resolve) => {
        const file = files[index];
        const rand = (Math.floor(Math.random() * 1000000)).toString(16);
        const path = `${this.path}/${this.type}/${rand}_${file.name}`;
        this.upload({
          path,
          data: file,
          index,
          count: files.length,
          completed: resolve,
        });
      });
    },
    upload({
      path,
      data,
      index = 0,
      count = 1,
      completed = null,
    }) {
      const storageRef = this.$storage.ref(path);
      this.$options.uploadTask = storageRef.put(data);

      const scaleProgress = p => p / count + index / count * 100;

      this.$options.uploadTask.on('state_changed', (snapshot) => {
        let progress = snapshot.bytesTransferred / snapshot.totalBytes;
        progress *= 90; // don't go to 100% just yet
        progress += this.RECEIVED_FILE;
        this.uploadProgress = scaleProgress(progress);
      },
      () => {
        // TODO: what to do if can't upload?
      },
      () => {
        this.uploadProgress = scaleProgress(95);
        this.$options.uploadTask.snapshot.ref.getDownloadURL()
          .then((url) => {
            this.uploadProgress = scaleProgress(100);
            this.$emit('uploaded', { url, type: this.type });
            if (completed) {
              completed(index);
            }
          });
      });
    },
    cancelUpload() {
      if (this.$options.uploadTask) {
        this.$options.uploadTask.cancel();
      }
      this.uploadProgress = 0;
    },
    recordingFinished({ blob, id }) {
      const path = `user-media/${this.type}/${id}.mp3`;
      this.upload({ path, data: blob });
    },
    micFailed(error) {
      console.error(error);
    },
  },
  created() {
    if (this.recordFromMic) {
      this.recorder = new AudioRecorder({
        recordingFinished: this.recordingFinished,
        micFailed: this.micFailed,
      });
    }
  },
  mounted() {
    const { fileinput } = this.$refs;
    fileinput.addEventListener('change', this.uploadMediaHandler);
  },
};
</script>

<style lang="scss" scoped>
</style>

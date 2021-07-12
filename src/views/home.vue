<template>
  <div class="mergeTool ofh">
    <div class="fl mergeMain" :loading="loading">
		<div style="float: right;padding-bottom: 30px;">
				<el-select v-model="selectedAudio" @change='getSelect' placeholder="请选择示例音频">
					<el-option
						v-for="item in options"
						:key="item.value"
						:label="item.text"
						:value="item.value">
					</el-option>
				</el-select>
		</div>

		<template v-for="(item, index) in fileList">
			<div class="wave">
				<div :id="'waveform_'+index"></div>
				<div :id="'waveTimeline_'+index"></div>
			</div>

			<div class="wave_operate mt40">
				<div class="wave_setting fl">
					<Icon type="play" class="fl font16 mr10" style="line-height: 38px;" @click.native="playPause(index)" v-if="!playingList[index]"></Icon>
					<Icon type="pause" class="fl font16 mr10" style="line-height: 38px;" @click.native="playPause(index)" v-else ></Icon>
					<span class="fl mr10" style="padding-right: 5px">播放</span>
					<Icon type="play" class="fl font16 mr10" style="line-height: 38px;" @click.native="playRegionPause(index)" v-if="!playingRegionList[index]"></Icon>
					<Icon type="pause" class="fl font16 mr10" style="line-height: 38px;" @click.native="playRegionPause(index)" v-else ></Icon>
					<span class="fl mr10" style="padding-right: 5px">播放选中</span>

					<span class="fl mr10">音量：</span>
					<Slider v-model="soundValue" :step="10" class="fl mr10"></Slider>
					<span class="fl mr10">语速：</span>
					<Slider v-model="speedValue" :step="10" class="fl"></Slider>
					<div class="clear"></div>
				</div>
				<Button type="primary" class="fr" style="margin-top:2px;" @click="resetClick(index)">重置操作</Button>
				<div class="clear"></div>
			</div>
		</template>
		<div style="padding-top: 20px; padding-bottom: 30px;">
			<Button type="primary" class="" v-if="fileList.length > 1" :disabled="isMergeAuditing" @click="mergeAuditionClick">合成试听</Button>
			<Button type="primary" class="" style="margin-left: 10px;" :disabled="isMerging" v-if="fileList.length > 1" @click="mergeClick">合成</Button>
		</div>
		<template v-if="showMergeAudio">
			<div style="height: 120px;">
				<audio id="audio" class="audio" controls="controls">浏览器不支持录音播放</audio>
				<Button type="primary" style="position: relative; bottom: 38%; margin-left: 20px;" @click="downloadClick">下载</Button>
			</div>
		</template>

	<!--<template v-for="(item, index) in mergedFileList" v-if="false">
			<audio :id="'audio_'+index" controls></audio>
			<Button type="primary" @click="downloadClick">下载</Button>
			<Button type="primary" @click="deleteMergeAudioClick(index)">删除</Button>
		</template>-->
		<div id="app">
			<div class="content">
				<div class="drag-area" @dragover="fileDragover" @drop="fileDrop">
					<div v-if="fileName" class="file-name">{{ fileName }}</div>
					<div v-else class="uploader-tips">
						<span>将文件拖拽至此，或</span>
						<label for="fileInput" style="color: #11A8FF; cursor: pointer">点此上传</label>
					</div>
				</div>
			</div>

			<div class="footer">
				<input type="file" id="fileInput" @change="chooseUploadFile" style="display: none;">
				<label for="fileInput" v-if="fileName" style="color: #11A8FF; cursor: pointer">选择文件</label>
			</div>
		</div>
    </div>
  </div>
</template>
<script>
import WaveSurfer from 'wavesurfer.js'
import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
import regionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import audioJson from '../../static/json/audio-20210711.json'
export default {
  data() {
    const worktime = (rule, value, callback) => {
      if (!this.list.startTime.length || !this.list.endTime.length) {// TODO 还要填写这个音频的开始时间和结束时间
          callback(new Error('请填写有效起止时间'));
      } else {
          callback();
      }
    };
    return {
		wavesurferList: [],
		fileList: [],
		cuttedAudioBufferList: [],
		playingList: [],
		playingRegionList: [],
		regionList: [],
		fileReaderError: false,
		mergedFileList: [],
		showMergeAudio: false,
		mergedAudioUrl : '',
		isMergeAuditing: false,
		isMerging: false,

		fileName: '',
		batchFile: '',
		MAX_FILE_SIZE: 10 * 1000 * 1000,
		MAX_FILE_COUNT: 5,

		selectedAudio: "",
		options: [],

      loading: false,//用于点击
      wavesurfer: '',//音频
      audioPath: '',//音频的地址
      durationallTime: '',//音频播放的总的时长
      playing: false,//音频正在播放的状态
      volume: 0.5,//0 = silent, 1 = maximum  [0-1]
      speed: 0.5,//0.5 is half speed, 1 is normal speed, 2 is double speed and so on
      soundValue: 50,//音量的大小  当50的时候才是正常速度
      speedValue: 50,//语速的大小  当50的时候才是正常速度

      list: {//左侧的form表单
        batchId: 0,
        private: '1',
        quarrel: '0',
        work: '1',
        unworkListModel: 'talk',//talk/laugh/sneeze/cough
        sound: '1',
        startTime: 120,
        endTime: 300,
        resetStartTime: 120,
        resetEndTime: 300,
      },
      startEndTimeMessage: '',//begin的提示信息和end的提示信息
      unworkLists: [
        {
          id: 'talk',
          name: '噪音',
        },
        {
          id: 'laugh',
          name: '笑声',
        },
        {
          id: 'sneeze',
          name: '方言',
        },
        {
          id: 'cough',
          name: '其他',
        }
      ],
      //right
      recordAllLen: 10,//段录音的总数
      workingIndex: 0,//当前正在做的题目 index
      audioArray: [],
      taskName: '',
      taskCreateTime: '',
      mediaId: 0,
      lastIndex: false,//确定是最后一道题目
      rootFlag: false //确定是不是管理员账号进入的查看
    }
  },
  watch: {
    soundValue: function(newval,oldval) {
      this.volume = newval/100;
      this.wavesurfer.setVolume(this.volume);
    },
    speedValue: function(newval,oldval) {
      this.speed = newval/100;

      // this.wavesurfer.backend.playbackRate = this.speed*2;
      this.wavesurfer.setPlaybackRate(this.speed*2);
      console.log(this.wavesurfer.getPlaybackRate(),this.wavesurfer.backend.playbackRate,'11111111');
      // console.log(this.speed*2);
    },
    audioArray: function(newval,oldval) {
      let hasworkedNum = 0;
      newval.forEach(item=>{
        if(item.processStatus == 2) {
          hasworkedNum++;
        }
      });

      this.recordAllLen = hasworkedNum;//当前已完成的数量
    },
    workingIndex: function() {
      if(this.workingIndex == this.audioArray.length-1) {
        this.lastIndex = true;
      } else {
        this.lastIndex = false;
      }
    }
  },
  methods: {
  	getSelect() {
  		let _this = this;
  		//console.log(this.selectedAudio);
		$.ajax({
			async: true,
			dataType: "binary",
			processData: false, responseType:'arraybuffer', url: this.selectedAudio, success: function (result) {
				//var myBlob = new Blob(result, {type : 'audio/mpeg'});
				//console.log(result)
				let blob = new Blob([result]);

				if(_this.fileList.length > 0) {
					for(let i = 0; i < _this.fileList.length; i++) {
						_this.wavesurferList[i].destroy();
					}
				}
				_this.wavesurferList = [];
				_this.fileList = [];
				_this.cuttedAudioBufferList = [];
				_this.playingList = [];
				_this.playingRegionList = [];
				_this.regionList = [];
				_this.fileReaderError = false;
				_this.mergedFileList = [];
				_this.showMergeAudio = false;
				_this.mergedAudioUrl  = '';
				_this.isMergeAuditing = false;
				_this.isMerging = false;

				_this.addClick(blob);
			}
		});
	},
  	cutAudio(file, start, end, index) {
  		let _this = this;
		let reader = new FileReader();
		reader.onload = function (event) {
			let arrBuffer = event.target.result;
			let audioCtx = new AudioContext();
			audioCtx.decodeAudioData(arrBuffer, function (audioBuffer) {
				//let duration = audioBuffer.duration;
				let channels = audioBuffer.numberOfChannels;
				let rate = audioBuffer.sampleRate;

				let startOffset = rate * start;
				let endOffset = rate * end;
				let frameCount = endOffset - startOffset;
				let cuttedAudioBuffer;

				cuttedAudioBuffer = new AudioContext().createBuffer(channels, endOffset - startOffset, rate);
				let anotherArray = new Float32Array(frameCount);
				let offset = 0;

				for (let channel = 0; channel < channels; channel++) {
					audioBuffer.copyFromChannel(anotherArray, channel, startOffset);
					cuttedAudioBuffer.copyToChannel(anotherArray, channel, offset);
				}
				_this.cuttedAudioBufferList.push({index: index, buffer: cuttedAudioBuffer});

				//let blob = bufferToWave(newAudioBuffer, frameCount);
				/**
				 * 转换成Base64使用下面的代码
				 var reader2 = new FileReader();
				 reader2.onload = function(evt){
				audio.src = evt.target.result;
			};
				 reader2.readAsDataURL(blob);
				 */
			});
		}
		reader.readAsArrayBuffer(file);
	},
	  mergeAudio(channel, audioBufferList, rate) {
		  let audioBufferLength = 0;
		  audioBufferList.forEach(audioBuffer => {
			  audioBufferLength+= audioBuffer.length;
			  channel = audioBuffer.numberOfChannels;
			  rate = audioBuffer.sampleRate;
		  });
		  let mergeAudioBuffer =  new AudioContext().createBuffer(channel, audioBufferLength, rate);

		  for (let i=0; i<mergeAudioBuffer.numberOfChannels; i++) {
			  let data = mergeAudioBuffer.getChannelData(i);
			  let indexTmp = 0;
			  for(let j = 0; j < audioBufferList.length; j++) {
			  	let audioBuffer = audioBufferList[j];
				  data.set(audioBuffer.getChannelData(i), indexTmp);
				  indexTmp+= audioBuffer.length;
			  }
		  }

		  return mergeAudioBuffer;
	  },
	  // 点击上传
	  chooseUploadFile(e) {
	  	let _this = this;
		  const file = e.target.files.item(0)

		  if (!file) return
		  if (file.size > this.MAX_FILE_SIZE) {
			  return alert('文件大小不能超过10M')
		  }
		  if (this.fileList.length >= this.MAX_FILE_COUNT) {
			  return alert('文件数量不能超过5个')
		  }

		  // 清空，防止上传后再上传没有反应
		  e.target.value = ''

		  this.addClick(file);
	  },
	  // 拖拽上传
	  fileDragover (e) {
		  e.preventDefault()
	  },
	  fileDrop (e) {
		  e.preventDefault()
		  const file = e.dataTransfer.files[0] // 获取到第一个上传的文件对象

		  if (!file) return
		  if (file.size > this.MAX_FILE_SIZE) {
			  return alert('文件大小不能超过10M')
		  }
		  if (this.fileList.length >= this.MAX_FILE_COUNT) {
			  return alert('文件数量不能超过5个')
		  }

		  this.addClick(file);
	  },
	  addClick(file) {
	  	this.loading = true;
	  	let newFileIndex = this.fileList.length;
		  this.fileList.push(file);

		  this.$nextTick(() => {
			  let index = this.fileList.length - 1;
			  let waveId = "#waveform_" + index;
			  let waveTimelineId = "#waveTimeline_" + index;

			  let createParam = {
				  container: waveId,
				  waveColor: 'violet',
				  progressColor: 'purple',
				  backend: 'MediaElement',
				  plugins: [
					  TimelinePlugin.create({
						  container: waveTimelineId
					  }),
					  regionsPlugin.create()
				  ]
			  };

			  let wavesurfer = WaveSurfer.create(createParam);

			  let audio = new Audio();
			  audio.src = URL.createObjectURL(file);
			  wavesurfer.load(audio);

			  wavesurfer.on('ready', ()=> {
				  let region = wavesurfer.addRegion({
					  start: 0,
					  end: 4,
					  color: 'rgba(29,0,49,0.3)'
				  });
				  this.regionList.push(region);

				  wavesurfer.on('region-update-end', (data)=> {//拖动region范围的时候
					  wavesurfer.pause();
					  this.playingRegionList.splice(newFileIndex, 1, false)
				  });

				  wavesurfer.setVolume(this.volume);
				  wavesurfer.on('finish',  ()=> {
					  this.playPause();
				  });
				  //保留上次的音频和音速
				  wavesurfer.setVolume(this.volume);
				  wavesurfer.setPlaybackRate(this.speed*2);
				  // console.log(wavesurfer.getCurrentTime());
				  //一个开关 频繁点击下一条

				  this.flag = false;

				  this.loading = false;
			  });

			  this.wavesurferList.push(wavesurfer);
			  this.playingList.push(false);
			  this.playingRegionList.push(false);
		  });
	  },
	  sleep (time) {
		  return new Promise((resolve) => setTimeout(resolve, time));
	  },
	  compare(property) {
		  return function (a, b) {
			  let value1 = a[property];
			  let value2 = b[property];
			  return value1 - value2;
		  }
	  },
	  async getMergedAudioBuffer() {
		  let _this = this;
		  this.cuttedAudioBufferList = [];
		  let channels = 2;
		  let rate = 48000;
		  for(let i = 0; i < this.regionList.length; i++) {
			  let region = this.regionList[i];
			  let file = this.fileList[i];

			  _this.cutAudio(file, region.start, region.end, i)
		  }
		  let maxWaitTime = 0;
		  while(this.cuttedAudioBufferList.length < this.fileList.length && !this.fileReaderError && maxWaitTime < 15000) {
			  await this.sleep(300).then(() => {
				  console.log('sleep callback')
			  })
			  maxWaitTime+= 300;
		  }

		  if(maxWaitTime > 15000) {
			  this.$Message.error('解析文件超时！');
			  return;
		  }

		  if(!this.fileReaderError) {
			  this.cuttedAudioBufferList.sort(this.compare("index"))
			  let audioBufferList = this.cuttedAudioBufferList.map(cuttedAudioBuffer => cuttedAudioBuffer.buffer);
			  return this.mergeAudio(channels, audioBufferList, rate);
		  } else {
			  this.$Message.error('解析文件失败！');
		  }
	  },
	  pauseAllPlaying() {
		  for(let i = 0; i < this.playingList.length; i++) {
			  this.playingList.splice(i, 1, false);
			  this.playingRegionList.splice(i, 1, false);
			  this.wavesurferList[i].pause();
		  }
	  },
	  async mergeAuditionClick() {
		  this.isMergeAuditing = true;
		  let mergedAudioBuffer = await this.getMergedAudioBuffer();
		  if(mergedAudioBuffer !== undefined) {
			  let audioCtx = new AudioContext();
			  // 创建AudioBufferSourceNode对象
			  let source = audioCtx.createBufferSource();
			  // 设置AudioBufferSourceNode对象的buffer为复制的3秒AudioBuffer对象
			  source.buffer = mergedAudioBuffer;
			  // 这一句是必须的，表示结束，没有这一句没法播放，没有声音
			  // 这里直接结束，实际上可以对结束做一些特效处理
			  source.connect(audioCtx.destination);
			  // 资源开始播放
			  source.start();

			  this.pauseAllPlaying();
			  this.isMergeAuditing = false;
		  }
	  },
	  async mergeClick() {
  		let _this = this;
  		this.isMerging = true;
		  let mergedAudioBuffer = await this.getMergedAudioBuffer();
		  if(mergedAudioBuffer !== undefined) {
			  let blob = this.bufferToWave(mergedAudioBuffer, mergedAudioBuffer.length);
			  this.showMergeAudio = true;
			  this.$nextTick(() => {
				  let audio = document.getElementById("audio");
				  _this.mergedAudioUrl = URL.createObjectURL(blob);;
				  audio.src = _this.mergedAudioUrl;
				  audio.play();
				  audio.loop = false;
				  audio.preload = true;

				  this.pauseAllPlaying();
				  this.isMerging = false;
			  });

			  /*this.mergedFileList.push(blob);
			  this.$nextTick(() => {
				  let audioElementId = "audio_" + (this.mergedFileList.length - 1);
				  let audio = document.getElementById(audioElementId);
				  audio.src = URL.createObjectURL(blob);
				  audio.play();
				  audio.loop = false;
				  audio.preload = true;
			  });*/
		  }
	  },

	  bufferToWave(abuffer, len) {
		  let numOfChan = abuffer.numberOfChannels,
			  length = len * numOfChan * 2 + 44,
			  buffer = new ArrayBuffer(length),
			  view = new DataView(buffer),
			  channels = [], i, sample,
			  offset = 0,
			  pos = 0;

		  // write WAVE header
		  setUint32(0x46464952);                         // "RIFF"
		  setUint32(length - 8);                         // file length - 8
		  setUint32(0x45564157);                         // "WAVE"

		  setUint32(0x20746d66);                         // "fmt " chunk
		  setUint32(16);                                 // length = 16
		  setUint16(1);                                  // PCM (uncompressed)
		  setUint16(numOfChan);
		  setUint32(abuffer.sampleRate);
		  setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
		  setUint16(numOfChan * 2);                      // block-align
		  setUint16(16);                                 // 16-bit (hardcoded in this demo)

		  setUint32(0x61746164);                         // "data" - chunk
		  setUint32(length - pos - 4);                   // chunk length

		  // write interleaved data
		  for (i = 0; i < abuffer.numberOfChannels; i++)
			  channels.push(abuffer.getChannelData(i));

		  while (pos < length) {
			  for (i = 0; i < numOfChan; i++) {             // interleave channels
				  sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
				  sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
				  view.setInt16(pos, sample, true);          // write 16-bit sample
				  pos += 2;
			  }
			  offset++                                     // next source sample
		  }

		  // create Blob
		  return new Blob([buffer], {type: "audio/wav"});

		  function setUint16(data) {
			  view.setUint16(pos, data, true);
			  pos += 2;
		  }

		  function setUint32(data) {
			  view.setUint32(pos, data, true);
			  pos += 4;
		  }
	  },
	  downloadClick() {
		  const fileLink = document.createElement('a')
		  let fileName = Math.random().toString().slice(-6);
		  fileLink.download = fileName
		  fileLink.style.display = 'none'
		  fileLink.href = this.mergedAudioUrl
		  // 触发点击
		  document.body.appendChild(fileLink)
		  fileLink.click()
		  // 然后移除
		  document.body.removeChild(fileLink)
	  },
    playPause(index) {
      if(this.playingList[index]) {
        this.playingList.splice(index, 1, false);
		  this.playingRegionList.splice(index, 1, false);
        this.wavesurferList[index].pause();
      } else {
		  this.playingList.splice(index, 1, true);
		  this.playingRegionList.splice(index, 1, false);
		  this.wavesurferList[index].play();
        // this.wavesurfer.setPlaybackRate(this.rate);
        // this.wavesurfer.setVolume(this.volume);
      }
    },
	  playRegionPause(index) {
		  if(this.playingRegionList[index]) {
			  this.playingRegionList.splice(index, 1, false);
			  this.playingList.splice(index, 1, false);
			  this.wavesurferList[index].pause();
		  } else {
			  this.playingRegionList.splice(index, 1, true);
			  this.playingList.splice(index, 1, false);
			  this.regionList[index].play();
		  }
	  },
    keydown(e) {//阻止键盘的默认事件
      e.preventDefault();
    },
    rightSpanClick(index) {//右边的span的点击
      //需要在重置界面
      let restdata = ()=> {
        this.startEndTimeMessage = '';
        this.$refs.list.resetFields();
        this.playing = false;
      }

      if(index == 0) {
        if(this.audioArray[0].processStatus == 2) {//前面一条已经标注
         restdata();
         this.workingIndex = index;
         this.mediaId = this.audioArray[0].id;
         this.getCurrentAudioInfo(this.mediaId);
        } else {
          this.$Message.error('请按照顺序标注！');
        }
      } else {
        if(this.audioArray[index-1].processStatus == 2) {//前面一条已经标注
         restdata();
         this.workingIndex = index;//从0开始算起的
         this.mediaId = this.audioArray[index].id;
         this.getCurrentAudioInfo(this.mediaId);
        } else {
          this.$Message.error('请按照顺序标注！');
        }
      }
    },
    startTimeBlur() {//起始时间的blur
      if(!parseFloat(this.list.startTime) || !parseFloat(this.list.endTime)) {
        if(parseFloat(this.list.startTime) == 0 && parseFloat(this.list.endTime)) {

        } else {
          this.startEndTimeMessage = '请输入数字';
          this.wavesurfer.clearRegions(regionsPlugin);
          return false;
        }
      }
      this.list.startTime = this.list.startTime ? parseFloat(this.list.startTime).toFixed(3) : '';
      this.list.endTime = this.list.endTime ? parseFloat(this.list.endTime).toFixed(3) : '';

      let starttime = parseFloat(this.list.startTime);
      let endtime = parseFloat(this.list.endTime);

      if(starttime >= 0) {
        if(endtime) {
          if(endtime <= this.durationallTime) {
            if(starttime < endtime) {//当前开始时间是大于0并且是小于结束时间
              this.wavesurfer.clearRegions(regionsPlugin);
              this.wavesurfer.addRegion({
                start: starttime,
                end: endtime,
                color: 'rgba(29,0,49,0.3)'
              });
            } else {
              this.startEndTimeMessage = '请保证开始时间小于结束时间';
            }
          } else {
            this.startEndTimeMessage = '请保证结束时间不大于音频总时长';
          }
        } else {
          if(starttime < this.durationallTime) {//当前开始时间小于整个音频的结束时间

          } else {
            this.startEndTimeMessage = '请保证开始时间不大于整个音频时长';
          }
        }
      } else {
        this.startEndTimeMessage = '开始时间要大于等于0';
        this.wavesurfer.clearRegions(regionsPlugin);
      }
    },
    endTimeBlur() {
      if(!parseFloat(this.list.startTime) || !parseFloat(this.list.endTime)) {
        if(parseFloat(this.list.startTime) == 0 && parseFloat(this.list.endTime)) {

        } else {
          this.startEndTimeMessage = '请输入数字';
          this.wavesurfer.clearRegions(regionsPlugin);
          return false;
        }
      }
      this.list.startTime = this.list.startTime ? parseFloat(this.list.startTime).toFixed(3) : '';
      this.list.endTime = this.list.endTime ? parseFloat(this.list.endTime).toFixed(3) : '';

      let starttime = parseFloat(this.list.startTime);
      let endtime = parseFloat(this.list.endTime);
      if(endtime >= 0 && endtime <= this.durationallTime) {
        if(starttime) {
          if(starttime < endtime) {//当前开始时间是大于0并且是小于结束时间
            this.wavesurfer.clearRegions(regionsPlugin);
            this.wavesurfer.addRegion({
              start: starttime,
              end: endtime,
              color: 'rgba(29,0,49,0.3)'
            });
          } else {
            this.startEndTimeMessage = '请保证结束时间大于开始时间';
          }
        }
      } else {
        this.startEndTimeMessage = '请保证结束时间大于起始时间并且小于或等于整个音频时长';
        this.wavesurfer.clearRegions(regionsPlugin);
      }
    },
    resetClick(index) {
      this.soundValue = 50;
      this.speedValue = 50;

		this.regionList[index].remove();
      this.wavesurferList[index].clearRegions();
		let region = this.wavesurferList[index].addRegion({
        start: 0,
        end: 4,
        color: 'rgba(29,0,49,0.3)'
      });
		this.regionList.splice(index, 1, region);
    },
	  deleteFileClick(index) {
		  this.fileList.splice(index, 1);
		  this.wavesurferList.splice(index, 1);
		  this.playingList.splice(index, 1);
		  this.playingRegionList.splice(index, 1);
		  this.regionList.splice(index, 1);
		  this.cuttedAudioBufferList.splice(index, 1);
	  },
	  deleteMergeAudioClick(index) {
		  this.mergedFileList.splice(index, 1);
	  }
  },
  created() {
  	this.options = audioJson.audioList;
  },
  mounted() {
  },
  destroyed() {
    $(document).unbind('keydown.a');
  }
}
</script>
<style lang="less">
.mergeTool {
  // height: auto;
  display: flex;
  // width: 100%;
  // background: #ebeef2;
  .ivu-input-wrapper {
    textarea.ivu-input {
      height: 78px;
    }
    &.last {
      textarea.ivu-input {
        height: 100px;
      }
    }
  }
  & > div.main_center {
    // height: 100%;
    flex: 0 0 20px;
    background: #ebeef2;
  }

  & > div.mergeMain {
    padding: 30px;
    background-color: #fff;
    &:first-child {
      flex: 2;
      .ivu-form {
        width: 75%;
      }
      .wave_operate {
        &:after {
          clear: both;
        }
        .wave_setting {
          width:610px;
          border: 1px solid #dddee1;
          border-radius: 5px;
          padding-left: 20px;
          margin-bottom: 38px;
          span {
            line-height: 36px;
          }
          .ivu-slider {
            width: 150px;
          }
          &:after {
            clear: both;
          }
        }
      }
      .wave {
		  width: 100%;
        overflow: auto;
		  padding-bottom: 20px;
      }
    }
    &:last-child {
      flex: 1;
      font-size: 14px;
      .title {
        font-size: 18px;
        font-weight: bold;
      }
      .info {
        margin-top:36px;
      }
      .record {//提交录音的这一行
        color: #a9aeb5;
        font-size: 14px;
        line-height: 34px;
        .hightline {
          color: #4a8df1;
        }
      }
      .xuhao {
        margin-top: 30px;
        span.fl {//默认状态是灰色状态
          height: 30px;
          line-height: 30px;
          color: #fff;
          background: #dddee1;
          text-align: center;
          border-radius: 5px;
          margin-right: 1%;
          margin-bottom: 10px;
          cursor: pointer;
        }
        span.fl.working {
          background: #4a8df1;
        }
        span.fl.hasworked {
          background: #19be6b;
        }
        span.fl.unvalid {
          background: #f90;
        }
        span.fl.working.hasworked {
          background: #4a8df1;
        }
      }
    }
	  .audio {
		  width: 30%;
		  margin-bottom: 25px;
		  margin-top: 25px;
	  }
  }

	.drag-area {
		height: 160px;
		border: dashed 2px #2d8cf0;
		margin-bottom: 10px;
		color: #777;
	}
	.uploader-tips {
		text-align: center;
		height: 200px;
		line-height: 160px;
	}
	.file-name {
		text-align: center;
		height: 200px;
		line-height: 200px;
	}
	.ivu-btn {
		border-radius: 20px;
	}
}
</style>



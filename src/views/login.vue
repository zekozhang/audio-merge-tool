<template>
  <div class="login">
	<img src="../images/loginBg.jpeg" alt="" width="100%" height="100%">
	<div class="loginForm">
		<Card :bordered="false">
			<p slot="title">
				音频剪辑合成工具
			</p>
			<div class="form-con">
				<Form ref="form" :model="form" :rules="rules">
					<FormItem prop="userName">
						<Input v-model="form.userName" placeholder="请输入用户名">
							<span slot="prepend">
								<i class="preUser"></i>
							</span>
						</Input>
					</FormItem>
					<FormItem prop="password">
						<Input type="password" v-model="form.password" placeholder="请输入密码" @on-enter="handleSubmit('form')">
							<span slot="prepend">
								<i class="prePwd"></i>
							</span>
						</Input>
					</FormItem>
					<FormItem style="margin-top: 50px;">
						<Button @click="handleSubmit('form')" type="primary" long>登录</Button>
					</FormItem>
				</Form>
			</div>
		</Card>
	</div>
  </div>
</template>
<script>
import MD5 from 'js-md5'
import {getlist,loginPost,getRoleMenu} from '@/api/api'
export default {
  data() {
    return {
		isRem: [],
		form: {
			userName: '',
			password: ''
		},
		rules: {
			userName: [
				{ required: true, message: '账号不能为空', trigger: 'blur' }
			],
			password: [
				{ required: true, message: '密码不能为空', trigger: 'blur' }
			]
		}
    }
  },
  methods: {
	handleSubmit(name){
		this.$refs[name].validate((valid) => {
			if (valid) {
				let account = this.form.userName;
				let password = this.form.password;
				if(account.startsWith("23") && account.length === 5 && account === password) {
					this.Cookies.set('userName',this.form.userName);
					let token = Math.random().toString().slice(-12);
					this.$store.commit('setToken', token);
					this.$store.commit('setSessionLogNum',0);
					this.$router.push({path: "/main/merge"});
				} else {
					this.$Message.error("用户名密码不正确");
				}
			} else {
				this.$Message.error('请检查输入的用户名或密码！');
			}
		})

	},
  },
  created() {

  }

}
</script>
<style lang="less">
@import url("../css/resetiview.less");
.login{
	height: 100%;
	width: 100%;
	// background-image: url("../images/loginBg.png");
	background-size: cover;
    background-position: center;
    position: relative;
	.loginForm{
		width: 400px;
		height: 490px;
		position: absolute;
		right: 320px;
		top: 50%;
		transform: translateY(-60%);
		.ivu-card{
			background: rgba(178, 183, 209,0.1);
			.ivu-card-head{
				border-bottom: none;
				padding: 72px 16px 60px 16px;
				p{
					font-size: 30px;
					height: 30px;
					color: #fff;
					font-weight: normal;
					line-height: 1;
				}
			}
			.ivu-card-body{
				padding: 0 44px;
				.preUser{
					width: 17px;
					height: 20px;
					display: inline-block;
					background: url("../images/usernameIcon.png") no-repeat;
				}
				.prePwd{
					width: 17px;
					height: 20px;
					display: inline-block;
					background: url("../images/passwordIcon.png") no-repeat;
				}
				.ivu-form-item{
					margin-bottom: 26px;
				}
				.ivu-input{
					height: 42px;
					color: #140828;
					font-size: 16px;
				}
				.ivu-input-group-prepend{
					border-radius: 2px;
				}
				.ivu-btn{
					height: 42px;
				}
				.pwdAction{
					padding-bottom: 70px;
					.ivu-checkbox-group{
						float: left;
						color: #fff;
						span{
							font-size: 16px;
							margin-right: 2px;
						}
					}
					.ivu-tooltip{
						float: right;
						font-size: 16px;
						color: #fff;
					}
				}
			}
		}
	}
}
</style>

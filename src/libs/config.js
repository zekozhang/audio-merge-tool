// Created by szatpig at 2018/6/19.

const hostname = location.hostname.split('.')[0];
const localArray = ['10', '127', 'localhost'];
//
const host = localArray.includes(hostname) ? 'http://127.0.0.1:8090/test/' : '/test/';

const siteConfig = {
    base: host
};

export default siteConfig

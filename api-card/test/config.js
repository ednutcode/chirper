process.env.NODE_ENV = 'test';

const config = require('../config');
const fs = require('fs');
const chai = require('chai');
const { expect } = require('chai');

describe('Config.js', () => {
    describe('twilio INFORMATIONS', () => {
        it('should have valid Twilio credentials', () => {
            expect(config.accountSid).to.match(/^AC/);
            expect(config.authToken).to.be.a('string').and.not.empty;
        });
    });

    describe('api INFORMATIONS', () => {
        it('should have a secure API password', () => {
            expect(config.apipassword).to.be.a('string').and.not.equal('4ZMSTeSpX8FD9er9ymNKAHUms74fFjAf');
            expect(config.apipassword.length).to.be.greaterThan(16);
        });
    });

    describe('services FILEPATH', () => {
        it('should have valid file paths for all services', () => {
            let services = ['amazon', 'cdiscount', 'twitter', 'whatsapp', 'paypal', 'google', 'snapchat', 'instagram', 'facebook', 'end', 'default'];
            services.forEach(e => {
                expect(fs.existsSync(config[e + 'filepath'])).to.equal(true);
            });
        });
    });
});
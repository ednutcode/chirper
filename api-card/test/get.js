process.env.NODE_ENV = 'test';

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/data.db');
const config = require('../config');
const server = require('../app');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = require('chai');
chai.use(chaiHttp);

describe('Get.js', () => {
    beforeEach((done) => {
        db.serialize(() => {
            db.run(`DELETE FROM calls`, () => {
                db.run(
                    `INSERT INTO calls(callSid, itsfrom, itsto, status, date, user, service, card_number, card_expiry, card_cvv) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    ['fakecallsid', '33123456789', '33123456789', 'test', 'testdate', 'test', 'default', '1234567812345678', '1225', '123'],
                    done
                );
            });
        });
    });

    describe('/get POST', () => {
        it('should return error for missing callSid', (done) => {
            chai.request(server)
                .post('/get')
                .type('form')
                .send({ password: config.apipassword })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });

        it('should return error for invalid callSid', (done) => {
            chai.request(server)
                .post('/get')
                .type('form')
                .send({ password: config.apipassword, callSid: 'badcallSid' })
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });

        it('should return call info for valid callSid', (done) => {
            chai.request(server)
                .post('/get')
                .type('form')
                .send({ password: config.apipassword, callSid: 'fakecallsid' })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.include({
                        callSid: 'fakecallsid',
                        itsfrom: '33123456789',
                        itsto: '33123456789',
                        status: 'test',
                        date: 'testdate',
                        user: 'test',
                        service: 'default',
                        card_expiry: '1225'
                    });
                    expect(res.body.card_number).to.match(/^\d{4}\*+\d{4}$/);
                    expect(res.body.card_cvv).to.equal('***');
                    done();
                });
        });
    });
});
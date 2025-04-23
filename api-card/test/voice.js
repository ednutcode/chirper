process.env.NODE_ENV = 'test';

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/data.db');
const config = require('../config');
const server = require('../app');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = require('chai');
chai.use(chaiHttp);

describe('Voice.js', () => {
    beforeEach((done) => {
        db.serialize(() => {
            db.run(`DELETE FROM calls`, () => {
                db.run(
                    `INSERT INTO calls(callSid, service, name, card_stage) VALUES(?, ?, ?, ?)`,
                    ['fakecallsid', 'paypal', 'TestUser', 'number'],
                    () => {
                        db.run(
                            `INSERT INTO calls(callSid, name, card_stage) VALUES(?, ?, ?)`,
                            ['fakecallsid2', 'TestUser', 'number'],
                            done
                        );
                    }
                );
            });
        });
    });

    describe('/voice POST', () => {
        it('should return error for missing callSid', (done) => {
            chai.request(server)
                .post('/voice/' + config.apipassword)
                .type('form')
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });

        it('should return TwiML for paypal service', (done) => {
            chai.request(server)
                .post('/voice/' + config.apipassword)
                .type('form')
                .send({ CallSid: 'fakecallsid' })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res).to.have.header('content-type', /text\/xml/);
                    expect(res.text).to.include('<Say>Hello TestUser.</Say>');
                    expect(res.text).to.include('<Play>');
                    done();
                });
        });

        it('should return TwiML for default service (service not in db)', (done) => {
            chai.request(server)
                .post('/voice/' + config.apipassword)
                .type('form')
                .send({ CallSid: 'fakecallsid2' })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res).to.have.header('content-type', /text\/xml/);
                    expect(res.text).to.include('<Say>Hello TestUser.</Say>');
                    expect(res.text).to.include('<Play>');
                    done();
                });
        });
    });
});
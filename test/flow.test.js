require('dotenv').config()
const axios = require('axios').default;

const test = async () => {
    let response = undefined;
    console.log('creating host');
    // register host
    const registerResponse = await axios.post(`${process.env.DEV_API_URL}/user`, {
        email: "host@host.com",
        nickname: "host",
        password: "Host123",
        ethAddress: "0x6Ed1B4Eb7055B836D571a76f6BbdB9695eFA8f87"
    },
        {
            headers: {
                'Content-Type': 'application/json',
            }
        });

    console.log(registerResponse.data);

    console.log('logging in host');

    // get auth token for HOST
    response = await axios.post(`${process.env.DEV_API_URL}/user/login`, {
        email: "host@host.com",
        password: "Host123"
    },
        {
            headers: {
                'Content-Type': 'application/json',
            }
        });
    // console.log(response)
    const hostAuthToken = `Bearer ${response.data.token}`;

    console.log('creating guest');

    // register guest 
    await axios.post(`${process.env.DEV_API_URL}/user`, {
        email: "guest@guest.com",
        nickname: "guest",
        password: "Guest123",
        ethAddress: "0xE5dFc64faD45122545B0A5B88726ff7858509600"
    },
        {
            headers: {
                'Content-Type': 'application/json',
            }
        });

    console.log('logging in guest');

    // get auth token for GUEST
    response = await axios.post(`${process.env.DEV_API_URL}/user/login`, {
        email: "guest@guest.com",
        password: "Guest123",
    },
        {
            headers: {
                'Content-Type': 'application/json',
            }
        });

    const guestAuthToken = `Bearer ${response.data.token}`;
    console.log('creating experience');

    // // create experience
    const experienceResponse = await axios.post(`${process.env.DEV_API_URL}/experience`,
        {

            nft: {
                title: "test1",
                start: "05-04-2021",
                duration: 5,
                description: "Test Test TEst!"
            },
            saveAsTemplate: 0,
            templateId: -1
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': hostAuthToken
            }
        }
    );

    console.log(experienceResponse.data);
    console.log('get experiences');

    // guest get experiences
    const getExperiences = await axios.get(`${process.env.DEV_API_URL}/experience?past=false`,
        {
            headers: {
                'Authorization': guestAuthToken
            }
        });

    console.log(getExperiences.data);
    const experienceToParticipate = getExperiences.data.experiences[getExperiences.data.experiences.length - 1];
    console.log('reservce experience');

    // reserve experience
    const reservedResponse = await axios.post(`${process.env.DEV_API_URL}/experience/${experienceToParticipate._id}/reserve`,
        undefined,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': guestAuthToken
            }
        }
    );

    // console.log(reservedResponse);
    console.log('start experience');
    console.log(experienceToParticipate._id);
    // start experience
    const startExperienceResponse = await axios.post(`${process.env.DEV_API_URL}/experience/${experienceToParticipate._id}/start`,
        undefined,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': hostAuthToken
            }
        }
    );

    console.log(startExperienceResponse);
    console.log('get past experiences host');


    // host get past experiences
    const getHostPastExperiences = await axios.get(`${process.env.DEV_API_URL}/experience?past=true`,
        {
            headers: {
                'Authorization': hostAuthToken
            }
        });

    console.log(getHostPastExperiences.data);
    console.log('get past experiences guest');


    // guest get past experiences
    const getGuestPastExperiences = await axios.get(`${process.env.DEV_API_URL}/experience?past=true`,
        {
            headers: {
                'Authorization': guestAuthToken
            }
        });

    console.log(getGuestPastExperiences.data);

};

test();
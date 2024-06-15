FROM node:20

WORKDIR /usr/src/app

COPY . .

ENV TWILIO_ACCOUNT_SID=ACde7da89081f9ba029c3437b855edda55 \
    TWILIO_AUTH_TOKEN=f6dc696125c586a43ed541473ba498af \
    TWILIO_SERVICE_SID=VAa0811298615bd4a84486fd5ac43cd5f0 \
    MONGO=mongodb+srv://jaseelta111:mvW6wA1yX7WhnhPY@cluster0.swxijv6.mongodb.net/motogear 




RUN apt-get update && apt-get install -y nano

RUN npm install

EXPOSE 3000

CMD ["npm","start"]
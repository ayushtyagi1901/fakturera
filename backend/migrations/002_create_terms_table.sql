-- Create terms table to store terms content in different languages
CREATE TABLE IF NOT EXISTS terms (
  id SERIAL PRIMARY KEY,
  language_code VARCHAR(10) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(language_code)
);

-- Create index on language_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_terms_language_code ON terms(language_code);

-- Insert English terms content
INSERT INTO terms (language_code, content) VALUES 
('en', 'By clicking on Invoice Now, you choose to register according to the information you have entered and the text on the registration page and the terms here, and at the same time accept the terms here.

You can use the program FREE for 14 days.

123 Fakturera is so easy and self-explanatory that the chance that you will need support is minimal, but if you should need support, we are here for you, with our office staffed most of the day. After the trial period, the subscription continues and costs 99 kronor excl. VAT per month, which is invoiced annually. If you do not want to keep the program, it is just to cancel the trial period by giving us notice within 14 days of registration.

You of course have the right to terminate the use of the program without cost, by giving us notice by email within 14 days of registration, that you do not want to continue with the program, and then of course do not pay anything either.

If we do not receive such notice from you within 14 days of registration, the order cannot be changed for natural reasons. By registration is meant the date and time when you chose to press the Invoice Now button.

Invoicing takes place for one year at a time.

The price for 123 Fakturera (special price kr 99:- / ord. price kr 159:- per month) is for annual fee Start for one year''s use of the program.

(When using the special price kr 99:-, one year period is calculated from registration.)

All prices are excl. VAT.

Offer, Inventory Management, Member Invoicing, Multi-user version and English printing are (or may be) add-on modules that can be ordered later.

Mediation, as well as invoicing, may be done from K-Soft Sverige AB, Box 2826, 187 28 Täby. We may in the future choose to cooperate with another company for e.g. mediation and invoicing. The customer relationship is of course with us. Payment is made to the company from which the invoice comes.

The annual fee is ongoing but if you do not want to continue to use the program, it is just to give notice thirty days before the start of the next one-year period.

The introductory price (kr 99:- per month) is for annual fee Start for the first year. After the first year, ord. price is invoiced which is currently, for annual fee Start, one hundred and fifty-nine kronor per month, for annual fee Remote Control, three hundred kronor per month and for annual fee Pro, three hundred and thirty-three kronor per month. After one year, annual fee Remote Control is invoiced as standard but you can choose Start or Pro by giving notice at any time before the due date.

If you choose to keep the program by not giving us notice by email before 14 days from registration, that you do not want to continue with the program, you accept that you will pay the invoice for your order. Not paying the invoice or late payment does not give the right to cancel the order. We are happy to help fix logo for you at cost price.

License for use of 123 Fakturera is of course sold according to applicable laws.

In order to more easily be able to help you and give you support as well as to follow the laws, we must for natural reasons save your information.

In connection with the storage of information, the law requires that we give you the following information:

If you order as a private person, you have the right of withdrawal that the law establishes. Your information is saved so that we can help you etc. We will use it to be able to help you if you need help, follow the laws regarding accounting etc. When upgrades and the like come, we may send you offers and the like about our products and services by email or the like. You may also be contacted by email, mail and telephone. If you do not want to be contacted, just send us an email about it.

You can at any time request not to receive information about upgrades by email, letter or the like and we will of course not do so. Such a request you send to us by email, letter or the like.

For natural reasons, we must save, process and move your data. Your information is saved until further notice. You give us consent to store, process and move your data, as well as to send you offers and the like by email, letter and the like, as well as to inform others that you are a customer. Due to the way software works, consent must also be given to other parties. The consent is therefore given to us, as well as to the companies and/or person/persons who own the software, source code, the website and the like. It is also given to current and future companies owned and/or controlled by one or more of those who today own and/or control us. It is also given to current and future persons (if any) who own or will come to own the software, source code, the website and the like. This both for current and future products and services. It is also given to another company, (such as K-Soft Sverige AB), which we can use to send/sell products, upgrades and the like, either by sub-mediating the software or otherwise.

You of course have the right to request access to, correction or deletion of the information we have about you. You also have the right to request limitation of the processing of your data, or to object to processing and the right to data portability. You of course have the right to complain to the supervisory authority. More legal info about us you can find here. It is the laws in Ireland that are applicable laws. It is of course completely voluntary to place your order. We of course do not use any automated profiling and not any automated decision-making either.

If you want to contact us, please use the information on this website.

Click on Invoice Now to register in accordance with the information you have entered and the terms here. (Date and time of the entry is automatically entered in our registers.)

Our experience is that our customers are very satisfied with the way we work and we hope and believe that it will also be your experience.

Have a nice day!')
ON CONFLICT (language_code) DO NOTHING;

-- Insert Swedish terms content
INSERT INTO terms (language_code, content) VALUES 
('sv', 'GENOM ATT klicka på Fakturera Nu så väljer ni att registrera enligt den information som ni har lagt in och texten på registrerings sidan och villkoren här, och accepterar samtidigt villkoren här.

Ni kan använda programmet GRATIS i 14 dagar.

123 Fakturera är så lätt och självförklarande att chansen för att du kommer behöva support är minimal, men om du skulle behöva support, så är vi här för dig, med vårt kontor bemannat större delen av dygnet. Efter provperioden så fortsätter abonnemanget och kostar 99 kronor exkl. moms per månad, som faktureras årligen. Om du inte vill behålla programmet, så är det bara att avbryta provperioden genom att ge oss besked inom 14 dagar från registrering.

Ni har självklart rätt att avsluta användningen av programmet utan kostnad, genom att ge oss besked per email inom 14 dagar från registrering, att ni inte vill fortsätta med programmet, och betalar då självklart inte heller något.

Om vi inte inom 14 dagar från registrering mottar sådant besked från er, så kan ordern av naturliga orsaker inte ändras. Med registrering menas det datum och klockslag då ni valde att trycka på knappen Fakturera Nu.

Fakturering sker för ett år i taget.

Priset för 123 Fakturera (specialpris kr 99:- / ord. pris kr 159:- per månad) är för årsavgift Start för ett års användning av programmet.

(Vid användning av specialpriset kr 99:- så räknas ett års perioden från registrering.)

Alla priser är exkl. moms.

Offert, Lagerstyrning, Medlemsfakturering, Fleranvändarversion och Engelsk utskrift är (eller kan vara) tilläggsmoduler som kan beställas senare.

Förmedling, samt fakturering kan komma att ske från K-Soft Sverige AB, Box 2826, 187 28 Täby. Vi kan i framtiden välja att samarbeta med annat företag för t.ex. förmedling och fakturering. Kundförhållandet är dock självklart med oss. Betalningen görs till det företag som fakturan kommer från.

Årsavgiften är löpande men om ni inte vill fortsätta att använda programmet, så är det bara att ge besked trettio dagar innan ingången av nästföljande ett års period.

Introduktionspriset (kr 99:- per månad) är för årsavgift Start för det första året. Efter det första året faktureras ord. pris vilket för närvarande är, för årsavgift Start, ett hundra och femtinio kronor per månad, för årsavgift Fjärrstyrning, tre hundra kronor per månad och för årsavgift Pro, tre hundra och trettiotre kronor per månad. Efter ett år faktureras årsavgift Fjärrstyrning som standard men ni kan välja Start eller Pro genom att ge besked när som helst innan förfallodagen.

Om ni väljer att behålla programmet genom att inte ge oss besked per email innan 14 dagar från registrering, om att ni inte vill fortsätta med programmet, så accepterar ni att ni kommer att betala fakturan för er beställning. Att inte betala fakturan eller sen betalning ger inte rätt till att annullera beställningen. Vi hjälper gärna att fiksa logo för er till självkostpris.

Licens för användning av 123 Fakturera säljs självklart enligt gällande lagar.

För att lättare kunna hjälpa er och ge er support samt för att följa lagarna, måste vi av naturliga orsaker spara er information.

I samband med lagring av information så kräver lagen att vi ger er följande information:

Om ni beställer som privatperson så har ni den ångerrätt som lagen fastställer. Er information sparas så att vi kan hjälpa er m.m. Vi kommer använda den för att kunna hjälpa er om ni behöver hjälp, följa lagarna ang. bokföring m.m. När det kommer uppgraderingar och liknande, kan vi komma att skicka er erbjudande och liknande om våra produkter och tjänster per email eller liknande. Ni kan också komma att bli kontaktad per email, post och telefon. Om ni inte vill bli kontaktad, bara skicka oss en email ang. det.

Ni kan när som helst begära att inte få tillsänt information om uppgraderingar per email, brev eller liknande och vi kommer då självklart inte att göra det. Sådan begäran skickar ni till oss per email, brev eller liknande.

Av naturliga orsaker måste vi spara, databehandla och flytta era data. Er information sparas tills vidare. Ni ger oss medgivande till att lagra, databehandla och flytta era data, samt att skicka er erbjudanden och liknande per email, brev och liknande, samt att informera andra om att ni är kund. Pga. sättet det fungerar på med programvara behöver medgivandet också ges till andra parter. Medgivandet ges därför till oss, samt till de företag och/eller person/personer som äger programvaran, källkod, hemsidan och liknande. Det ges också till nuvarande och framtida företag ägda och/eller kontrollerade av en eller flera av de som i dag äger och/eller kontrollerar oss. Det ges också till nuvarande och framtida personer (om några) som äger eller kommer till att äga programvaran, källkod, hemsidan och liknande. Detta både för nuvarande och framtida produkter och tjänster. Det ges också till ett annat företag, (som K-Soft Sverige AB), som vi kan använda för att skicka/sälja produkter, uppgraderingar och liknande, antingen genom att under förmedla programvaran eller på annat sätt.

Ni har självklart rätt att begära tillgång till, rättelse eller radering av informationen vi har om er. Ni har också rätt att begära begränsning av behandlingen av era uppgifter, eller att invända mot behandling samt rätten till dataportabilitet. Ni har självklart rätt att klaga till tillsynsmyndighet. Mer juridisk info om oss hittar ni här. Det är lagarna i Irland som är gällande lagar. Det är självklart helt frivilligt att lägga er order. Vi använder självklart inte någon automatiserad profilering och inte heller något automatiserat beslutsfattande.

Om ni vill kontakta oss, vänligen använd då informationen på denna hemsidan.

Klicka på Fakturera Nu för att registrera i enlighet med den information som ni har lagt in och villkoren här. (Datum och tidpunkt för inläggningen läggs in automatiskt i våra register.)

Vår erfarenhet är att våra kunder är mycket nöjda med sättet vi arbetar på och vi hoppas och tror att det också kommer att bli er upplevelse.

Ha en trevlig dag!')
ON CONFLICT (language_code) DO NOTHING;


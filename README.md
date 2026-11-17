
# OmaTahti – Asynchronous Remote Rehabilitation

OmaTahti on asynkronisen etäkuntoutuksen sovellusprototyyppi, jonka tavoitteena on mahdollistaa kuntoutuminen joustavasti omaan tahtiin.

Sovelluksen ideana on tarjota vaihtoehto perinteisille reaaliaikaisille etävastaanotoille. Kuntoutuja voi harjoitella itsenäisesti silloin, kun se sopii omaan arkeen, ja fysioterapeutti voi seurata kuntoutumisen etenemistä sekä antaa palautetta ilman, että jokainen kohtaaminen edellyttää samanaikaista videoyhteyttä.

Projektin ensimmäinen demoversio on toteutettu [Lovable](https://lovable.dev/)-kehitysalustalla. Sovelluksen lähdekoodi on yhdistetty GitHubiin, mikä mahdollistaa projektin jatkokehityksen myös paikallisessa kehitysympäristössä.

## Projektin tavoitteet

OmaTahdin tavoitteena on:

- Mahdollistaa kuntoutuminen ajasta ja paikasta riippumatta.
- Helpottaa kuntoutujan ja fysioterapeutin välistä yhteydenpitoa.
- Tukea kuntoutumisen etenemisen seurantaa.
- Hyödyntää tekoälyä kuntoutujan lähtötilanteen arvioinnissa ja kuntoutumisen seurannassa.
- Tukea kuntoutujan motivaatiota pelillistämisen avulla.
- Tehostaa fysioterapeuttien ajankäyttöä ja parantaa kuntoutuspalveluiden saavutettavuutta.

## Sovelluksen toimintaperiaate

OmaTahdin kuntoutuspolku rakentuu seuraavista vaiheista:

1. **Alkukartoitus:** Kuntoutuja vastaa vammaa ja toimintakykyä koskeviin kysymyksiin.
2. **Lähtötilanteen arviointi:** Liikkeiden arviointia hyödynnetään kuntoutujan lähtötason hahmottamisessa.
3. **Harjoitusohjelman muodostaminen:** Alkukartoituksen perusteella muodostetaan kuntoutujalle kohdennettu harjoitusohjelma.
4. **Itsenäinen harjoittelu:** Kuntoutuja suorittaa harjoituksia ohjevideoiden ja muiden ohjeiden avulla.
5. **Seuranta ja palaute:** Kuntoutumisen etenemistä seurataan, ja kuntoutuja voi olla yhteydessä fysioterapeuttiin.

Tavoitteena on, että kuntoutuja saa tukea koko kuntoutusprosessin ajan, mutta voi edetä omaan tahtiinsa.

## Teknologiat

Projektissa käytetään seuraavia teknologioita ja työkaluja:

| Teknologia | Käyttötarkoitus |
|---|---|
| React | Käyttöliittymän rakentaminen |
| TypeScript | Tyypitetty JavaScript |
| TanStack Start | Sovelluksen rakenne ja reititys |
| Vite | Kehityspalvelin ja sovelluksen build |
| Tailwind CSS | Käyttöliittymän tyylittely |
| MediaPipe Tasks Vision | Kamerapohjainen liikkeiden analysointi |
| Bun | JavaScript-ajonaikainen ympäristö ja paketinhallinta |
| GitHub | Lähdekoodin versionhallinta |
| Lovable | Ensimmäisen demoversion toteutus |

## Projektin rakenne ja kehitysympäristö

Sovellus on toteutettu React- ja TypeScript-pohjaisena projektina. TanStack Start huolehtii sovelluksen rakenteesta ja reitityksestä, ja Vite toimii kehitysympäristönä.

Projektissa käytetään Lovablen ylläpitämää `@lovable.dev/vite-tanstack-config`-konfiguraatiota. Se sisältää valmiiksi tarvittavat Vite- ja TanStack-asetukset.

Riippuvuuksien hallintaan käytetään Bunia ja projektin `bun.lock`-lukitustiedostoa.

## Paikallinen käyttöönotto

### Vaatimukset

Paikalliseen kehittämiseen tarvitaan:

- [Bun](https://bun.sh/)
- [Git](https://git-scm.com/)
- Koodieditori, esimerkiksi [Visual Studio Code](https://code.visualstudio.com/)

Tarkista Bun-asennus komennolla:

```bash
bun --version
```

### 1. Kloonaa projekti

Avaa terminaali ja suorita:

```bash
git clone https://github.com/JansQ-75/OmaTahti.git
```

Siirry projektikansioon:

```bash
cd OmaTahti
```

### 2. Asenna riippuvuudet

Asenna projektin tarvitsemat paketit:

```bash
bun install
```

Bun hyödyntää projektin `bun.lock`-lukitustiedostoa riippuvuuksien versioiden yhdenmukaistamiseen.

### 3. Käynnistä sovellus paikallisesti

Käynnistä kehityspalvelin:

```bash
bun run dev
```

Terminaali ilmoittaa paikallisen osoitteen, josta sovellus on avattavissa selaimessa.

Avaa terminaalissa ilmoitettu osoite selaimessa.

### 4. Sovelluksen testaaminen puhelimella

Sovellusta voidaan testata myös puhelimen selaimessa paikallisen lähiverkon kautta. Erillistä Wi-Fi-verkkoa ei tarvita, sillä puhelimen mobiilitukiasemaa voidaan käyttää verkkoyhteyden muodostamiseen.

1. Ota puhelimen mobiilitukiasema käyttöön.
2. Yhdistä tietokone puhelimen jakamaan verkkoon.
3. Käynnistä kehityspalvelin sallimalla yhteydet myös lähiverkosta:

```bash
bun run dev -- --host 0.0.0.0
```

4. Selvitä tietokoneen paikallinen IP-osoite. Windowsissa osoitteen saa komennolla:

```bash
ipconfig
```

5. Etsi aktiivisen verkkoyhteyden IPv4-osoite.
6. Avaa puhelimen selaimessa seuraava osoite:

```text
http://TIETOKONEEN-IP:PORTTI
```

Korvaa osoite tietokoneen omalla IPv4-osoitteella ja käytä terminaalissa ilmoitettua porttia.

**Huomio kameran käytöstä:** Puhelimen selaimet edellyttävät kameran käyttöön yleensä suojattua HTTPS-yhteyttä. Paikallisessa lähiverkossa käytettävä HTTP-osoite ei välttämättä mahdollista kameran käyttöä. Kameratoimintojen testaamiseen voidaan tarvita erillinen HTTPS-yhteys esimerkiksi tunnelointipalvelun avulla.

## Projektin tila

OmaTahti on Demola-projektissa kehitettävä sovellusprototyyppi. Projektin tavoitteena on havainnollistaa asynkronisen etäkuntoutuksen mahdollisuuksia sekä kuntoutujan että fysioterapeutin näkökulmasta.

Prototyyppiä kehitetään ja testataan projektin edetessä. Kaikki suunnitellut ominaisuudet eivät välttämättä ole vielä käytettävissä tai valmiita tuotantokäyttöön.

## Linkit

- [GitHub-repositorio](https://github.com/JansQ-75/OmaTahti)
- [Lovable](https://lovable.dev/)

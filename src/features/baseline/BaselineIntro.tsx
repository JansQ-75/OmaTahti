import { ArrowRight, Camera, ScanLine, ShieldCheck, Timer } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function BaselineIntro({ onContinue }: { onContinue: () => void }) {
  return <div className="mx-auto max-w-2xl space-y-6">
    <header>
      <p className="text-sm font-semibold text-primary">Alkukartoitus · Lähtötasotestit</p>
      <h1 className="mt-1 text-3xl font-bold">Miten kameratesti toimii?</h1>
      <p className="mt-3 text-lg">Kamera tunnistaa liikkeesi. Jokaisen testin omat asento- ja liikeohjeet näet ennen kameran käynnistämistä.</p>
    </header>
    <ol className="space-y-5">
      <li className="flex gap-4"><ScanLine className="mt-1 h-7 w-7 shrink-0 text-primary" aria-hidden /><div className="min-w-0"><h2 className="text-xl font-semibold">1. Asetu kuvaan</h2><p className="mt-1">Salli kameran käyttö. Asetu ohjeen mukaiseen asentoon hyvässä valaistuksessa. Nivelpisteet ja viivat näkyvät kuvassa, kun kamera tunnistaa sinut. Keltainen kehys muuttuu vihreäksi, kun tunnistus on riittävän luotettava.</p></div></li>
      <li className="flex gap-4"><Timer className="mt-1 h-7 w-7 shrink-0 text-primary" aria-hidden /><div className="min-w-0"><h2 className="text-xl font-semibold">2. Odota lähtölaskentaa</h2><p className="mt-1">Pysy hetki paikallasi. Kamera käynnistää viiden sekunnin lähtölaskennan automaattisesti. Aloita liike vasta ruudun aloitusmerkillä. Tasapainotestissä odota molemmilla jaloilla ja nosta toinen jalka vasta aloitusmerkillä. Kuulet myös äänimerkin, jos äänet ovat päällä.</p></div></li>
      <li className="flex gap-4"><Camera className="mt-1 h-7 w-7 shrink-0 text-primary" aria-hidden /><div className="min-w-0"><h2 className="text-xl font-semibold">3. Tee testi rauhallisesti</h2><p className="mt-1">Seuraa ruudun lyhyttä kehotetta ja sekuntilaskuria. Jos kehys muuttuu keltaiseksi, tarkista että pysyt kuvassa. Äänimerkki ilmoittaa testin päättymisestä, jos äänet ovat päällä. Jokaisen testin jälkeen näet kuittauksen ja tallennetun tuloksen.</p></div></li>
    </ol>
    <div className="flex gap-3 border-y border-border py-4"><ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden /><div className="min-w-0 space-y-2"><p>Videota ei tallenneta eikä lähetetä minnekään. Liikettä arvioidaan omalla laitteellasi, ja vain testitulokset tallentuvat.</p><p className="text-sm text-muted-foreground">Kamera-arviot eivät ole kliinisiä mittauksia. Voit jatkaa myöhemmin: tehdyt testit säilyvät, mutta harjoitusohjelma avautuu vasta koko alkukartoituksen valmistuttua.</p></div></div>
    <div className="flex flex-col items-start gap-3">
      <Button size="lg" className="h-auto min-h-14 w-full whitespace-normal text-lg" onClick={onContinue}>Aloitetaan testit <ArrowRight /></Button>
      <Button asChild variant="outline"><Link to="/asiakas">Jatka myöhemmin</Link></Button>
    </div>
  </div>;
}
# Bonus Hunt Tracker

Narzędzie do śledzenia bonus huntów w kasynach online: kasa na start, lista slotów z betami, wpisywanie wygranych na żywo, zysk/strata, break-even i podział wypłaty między ekipę, która się zrzuciła.

Tylko klient, bez backendu i bez logowania. Wszystko zapisuje się w `localStorage` przeglądarki.

## Workflow git — obowiązkowy

**Każdą zakończoną i zweryfikowaną zmianę commituj i pushuj sam, bez pytania o zgodę.** To jest domyślny tryb pracy w tym repo.

1. `npm run build` musi przejść (testów nie ma, build to minimalna weryfikacja).
2. Jeśli zmiana jest widoczna w UI, odpal apkę i sprawdź ją w przeglądarce.
3. `git add` tylko plików, które faktycznie zmieniłeś. Nigdy `dist/` ani `node_modules/`, oba są w `.gitignore`.
4. Commit z opisowym komunikatem po angielsku: pierwsza linia mówi co, a treść dlaczego i jakie są skutki uboczne.
5. Push na `origin main`:

   ```bash
   git -c http.sslBackend=schannel push
   ```

   Flaga `schannel` jest potrzebna na Windowsie z antywirusem przechwytującym HTTPS (np. AVG). Bez niej push kończy się błędem `SSL certificate problem: unable to get local issuer certificate`. **Nigdy nie ustawiaj `http.sslVerify=false`**, bo to wyłącza weryfikację certyfikatów.
6. Na koniec powiedz krótko, co zostało wypchnięte (hash commita).

Zakazane: `push --force`, przepisywanie historii (`rebase`/`reset` na wypchniętych commitach), usuwanie gałęzi. Jeśli push zostanie odrzucony, bo remote ma nowsze commity, zrób `git pull --rebase`, rozwiąż konflikty i dopiero wtedy pushuj. Jeśli nie wiesz, jak rozwiązać konflikt, zatrzymaj się i zapytaj.

## Sekrety: traktuj repo jak publiczne

Wszystko, co trafi do repo, łącznie z historią commitów, może zobaczyć każdy. Usunięcie pliku w kolejnym commicie **nie** usuwa go z historii.

- **Nigdy nie commituj sekretów:** kluczy API, tokenów, haseł, connection stringów, plików `.env`. Pliki `.env` i `.env.*` są w `.gitignore` i tak ma zostać.
- Przed każdym commitem przejrzyj `git diff --cached` pod kątem sekretów. Jeśli coś wygląda na klucz albo token, nie commituj, tylko zatrzymaj się i zapytaj.
- Konfigurację trzymaj w `.env.local`, który nie trafia do repo. Jeśli potrzebny jest wzór, dodaj `.env.example` z pustymi wartościami.
- **Uwaga na Vite:** każda zmienna `VITE_*` jest wklejana do zbudowanego JS, więc zobaczy ją każdy odwiedzający stronę. Na froncie mogą być tylko klucze publiczne z założenia (np. `anon` key Supabase z włączonym RLS). Kluczy serwerowych (np. `service_role`) nie wolno używać w tej apce w ogóle.
- Na produkcji zmienne środowiskowe ustawia się w panelu Vercela, a nie w repo.
- Jeśli sekret już trafił do repo, sam commit „usuwający” nic nie da. Zatrzymaj się i powiedz, że klucz trzeba **natychmiast unieważnić i wygenerować nowy**.

## Komendy

```bash
npm install      # pierwszy raz
npm run dev      # dev server na http://localhost:5173
npm run build    # build produkcyjny do dist/, służy też jako weryfikacja
```

Konfiguracja podglądu dla Claude Code jest w `.claude/launch.json` (nazwa: `bonus-hunt-dev`).

## Stack

React 18 + Vite 5 + Tailwind CSS 3. Żadnych innych zależności runtime. Nie dodawaj bibliotek bez wyraźnej potrzeby.

## Struktura

```
src/
  App.jsx                  cały stan aplikacji + handlery + zapis do localStorage
  calc.js                  cała matematyka (czyste funkcje): huntStats, overallStats, splitPayouts, formatowanie
  storage.js               odczyt/zapis localStorage + fabryki: createHunt, createEntry, createParticipant
  cloud.js                 synchronizacja huntów z Supabase (opcjonalna, scalanie i realtime)
  discord.js               budowa i wysyłka podsumowania hunta na webhook Discorda
  wheel.js                 losowanie ważone i localStorage koła zrzutki (czyste funkcje)
  confetti.js              efekt konfetti na canvasie, bez zależności
  index.css                fonty, tło, neonowe efekty, animacje
  components/
    HuntHeader.jsx         logo, bilans ze wszystkich huntów, zakładki Hunt/Koło zrzutki, wybór hunta, zakończenie hunta (webhook Discord), nowy/usuń hunt
    NewHuntButton.jsx      przycisk „nowy hunt” z dymkiem na nazwę („Jak nazywamy jazdę?”)
    SummaryBar.jsx         edytowalna nazwa/waluta/kasa na start + statystyki: wygrana, zysk/strata, break-even, pasek postępu; w tej samej ramce siedzi podokno z podziałem
    ParticipantsPanel.jsx  „Podział szmalu”: podokno SummaryBara; domyślnie sam wynik, dodawanie i zmiany pod przyciskiem edycji
    AddEntryForm.jsx       rząd pól do dodania slota (renderowany w EntryTable, nie osobno)
    EntryTable.jsx         jeden panel: dodawanie slota na górze + tabela slotów z wpisywaniem wygranych
    WheelPanel.jsx         koło zrzutki: losowanie kwoty wpłaty z wagami i konfetti
```

Logika liczenia ma zostać w `calc.js` jako czyste funkcje, a komponenty tylko wyświetlają wyniki.

## Model danych

Klucz w localStorage: `bonushunt.hunts.v1`, wartość to tablica huntów.

```js
hunt = {
  id, name, currency,        // domyślnie 'Jebanka po wypłacie', '€'
  startBalance,              // number
  createdAt,
  entries: [entry],
  participants: [participant],
}
entry       = { id, name, bet, win /* null dopóki nieotwarty */, opened }
participant = { id, name, amount, paidBy /* id osoby, która wpłaciła; null = sam za siebie */ }
```

**Kompatybilność wstecz:** w przeglądarkach użytkowników leżą stare hunty zapisane wcześniejszymi wersjami, np. bez `participants`. Zawsze czytaj pola opcjonalnie (`h.participants || []`). Jeśli zmieniasz kształt danych w sposób niekompatybilny, podbij wersję klucza i dopisz migrację w `loadHunts`, żeby nie wyczyścić ludziom danych.

Koło zrzutki ma osobny klucz `bonushunt.wheel.v1` (niezależny od huntów):

```js
wheelState = {
  options: [{ id, amount, weight }],  // amount = kwota do wpłaty, weight = waga losowania (nie %)
  background: dataUrlOrNull,          // obrazek tła koła jako data URL (skalowany do 900px przy uploadzie)
}
```

Procent szansy to `weight / suma(weight) * 100`, liczony w locie (`withPercentages` / komponent), nigdy nie zapisywany na sztywno.

## Zasady liczenia

- **Zysk / strata** = suma wygranych z otwartych slotów − kasa na start.
- **Ogólny multi** = suma wygranych ÷ kasa na start.
- **Do zera trzeba (break-even)** = (kasa na start − suma wygranych) ÷ suma betów nieotwartych slotów. Gdy jesteś już na plusie, wynik to `null` i wyświetla się `—`.
- **Multi slota** = wygrana ÷ bet.
- **Bilans wszystkich huntów** (`overallStats`) = suma kasy na start i suma wygranych ze wszystkich huntów, policzona osobno dla każdej waluty (nie sumuj € z $).
- **Podział dla ekipy** (`splitPayouts`):
  - udział = wkład osoby ÷ suma wkładów,
  - wypłata brutto = aktualna suma wygranych × udział,
  - jeśli wkład osoby A wpłaciła osoba B, to A oddaje B kwotę swojego wkładu z wypłaty.
  - Przykład: Michał 20, Czesław 40, wygrana 600 → 200 / 400. Jeśli Czesław wpłacił też za Michała → 180 / 420. Przy wygranej 0 → −20 / +20.
  - Suma wypłat netto zawsze równa się sumie wygranych. Zachowaj ten niezmiennik.

Po zmianach w `calc.js` sprawdź obliczenia na przykładach powyżej, np. szybkim skryptem:

```bash
node --input-type=module -e "import { splitPayouts } from './src/calc.js'; console.log(splitPayouts([{id:'m',name:'Michał',amount:20,paidBy:'c'},{id:'c',name:'Czesław',amount:40,paidBy:null}], 600).rows.map(r => r.name + ' ' + r.net))"
```

## UI i styl

**Język:** interfejs jest po polsku. Po angielsku zostają tylko nazwa „Bonus Hunt Tracker” i branżowe terminy: **Slot, Bet, Multi**. Ton jest luźny, gamblerski i z humorem („Napierdalamy”, „Dorzuć slota”, „Spadaj”, „Pusto jak w portfelu”, „🔥 Mega banger”). Nowe teksty trzymaj w tym klimacie, a nie w korpo-stylu.

**Design:** kasyno w neonach na ciemnym fioletowo-czarnym tle. Używaj tokenów z `tailwind.config.js` zamiast wpisywać kolory z ręki:

| Token | Użycie |
|---|---|
| `bg`, `bg-deep`, `bg-panel`, `bg-raised` | tła, od najciemniejszego |
| `line`, `line-bright` | obramowania |
| `gold`, `gold-bright` | akcent główny, wygrane, multi ≥10x |
| `pink` | akcent drugi, mega wygrane ≥50x, dodawanie slotów |
| `cyan` | ekipa i podział |
| `violet` | akcenty poboczne |
| `win` / `loss` | zysk / strata |
| `cream` / `muted` | tekst główny / drugorzędny |

Fonty: `font-display` (Bungee) na nagłówki i przyciski, `font-sans` (Inter) na UI, `font-mono` (JetBrains Mono) na wszystkie kwoty i liczby.

Gotowe klasy w `index.css`: `neon-gold`, `neon-pink`, `neon-win`, `neon-loss` (świecący tekst), `gradient-frame` (tęczowa ramka panelu), `btn-jazda` (animowany gradient na głównym przycisku), `pulse-glow`, `blink`, `row-settle`. Cienie: `shadow-neon-gold`, `shadow-neon-pink`, `shadow-neon-cyan`, `shadow-neon-win`, `shadow-panel`.

Wymagania:
- Apka musi działać na telefonie (~375px szerokości). Tabele trzymaj w `overflow-x-auto`, a wiersze formularzy w `flex-wrap`.
- Kwoty zawsze formatuj przez `formatMoney(value, hunt.currency)`, a multi przez `formatMult`.

## Synchronizacja z chmurą (Supabase)

Opcjonalna. Bez zmiennych `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY` apka działa dokładnie jak wcześniej: sam `localStorage`, `cloud.js` jest wtedy no-opem. Ustaw je w `.env.local` lokalnie i w panelu Vercela na produkcji, wzór jest w `.env.example`.

- Schemat bazy leży w `supabase/schema.sql`, wklejasz go w SQL Editor w Supabase. Jeden wiersz = jeden hunt, cały JSON w kolumnie `data`, więc zmiana kształtu hunta nie wymaga migracji.
- **Bez logowania.** RLS pozwala roli `anon` czytać i pisać, czyli kto zna adres apki, ten widzi i edytuje hunty ekipy. Świadoma decyzja, nie przeoczenie. Jeśli kiedyś ma to być prywatne, trzeba dołożyć Supabase Auth i polityki po `user_id`.
- `localStorage` zostaje źródłem prawdy na czas offline. Przy starcie robimy pull i scalamy, potem realtime dosyła zmiany z innych urządzeń, a lokalne zmiany lecą w górę po ~700 ms zwłoki.
- Konflikty rozstrzyga nowszy `updated_at`, czyli ostatni zapis wygrywa. Znaczniki czasu z serwera trzymamy w `bonushunt.sync.v1`, osobno od huntów, żeby nie ruszać ich kształtu.
- Kasowanie hunta to update z `deleted = true` (tombstone), inaczej inne urządzenia wskrzesiłyby go przy następnym pushu.
- Nigdy nie używaj klucza `service_role`. Wszystko z prefiksem `VITE_` ląduje w zbudowanym JS.

Dwie pułapki, na które już się nadzialiśmy:

- Same polityki RLS nie wystarczą, rola `anon` potrzebuje jeszcze `GRANT`-ów na tabeli. Bez nich REST oddaje 401 `permission denied for table hunts`. Granty są w `schema.sql`.
- Scalanie danych z chmury nie może siedzieć w funkcji aktualizującej stan (`setHunts(prev => ...)`). Ma skutki uboczne, a React w StrictMode woła updater dwa razy i drugie przejście cofa świeżo przyjętą zmianę. Dlatego `subscribeToHunts` dostaje getter stanu i scala poza Reactem. Z tego samego powodu kanał realtime ma losową nazwę: przy stałej drugi montaż efektu ubijał nasłuch.

## Znane ograniczenia i pomysły na dalej

- Nie ma export/import JSON, więc jedyny backup poza przeglądarką to Supabase.
- „Do zera trzeba” pokazuje `—`, gdy hunt jest już na plusie. Lepiej byłoby wyświetlić np. „✅ Już odrobione”.
- Nowy hunt pyta tylko o nazwę, w dymku przy przycisku (Escape albo klik obok zamyka). Walutę i kasę na start (oraz nazwę) zmienia się potem w panelu hunta, klikając w wartość — pola do edycji mają przerywaną ramkę i ołówek. Kasę da się też zsynchronizować z sumą wkładów przyciskiem w panelu ekipy.

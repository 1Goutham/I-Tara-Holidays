import { Counter } from '../ui/counter';

export function Intro() {
  return (
    <section className="intro" id="about" data-theme="dark">
      <div className="container">
        <div className="intro__grid">
          <p className="label" data-fade>(01) The I Tara way</p>
          <div>
            <p className="intro__lead" data-split>
              In Himalayan tradition, Tara watches over every traveller. We took her name because it describes the work: plan with care, carry the worry, and leave you free to simply <em>arrive.</em>
            </p>
            <p className="intro__body" data-fade>
              Every itinerary is built by a specialist who has been there, with stays we have checked ourselves and a real person to call at any hour, from a houseboat in Alleppey to a winter week in the Alps.
            </p>
          </div>
        </div>
        <span className="rule" data-rule />
        <dl className="figures">
          <div data-fade><dt>Travellers looked after</dt><dd><Counter to={25000} suffix="+" /></dd></div>
          <div data-fade><dt>Destinations</dt><dd><Counter to={120} suffix="+" /></dd></div>
          <div data-fade><dt>Years of planning</dt><dd><Counter to={15} /></dd></div>
          <div data-fade><dt>Average rating</dt><dd><Counter to={4.9} decimals={1} /></dd></div>
        </dl>
      </div>
    </section>
  );
}
